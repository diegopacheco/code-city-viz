#!/usr/bin/env python3
import subprocess
import os
import sys
import json
import shutil
import re

BUG_KEYWORDS = [
    r'\bfix\b', r'\bfixed\b', r'\bfixes\b', r'\bfixing\b',
    r'\bbug\b', r'\bbugs\b', r'\bbugfix\b',
    r'\berror\b', r'\berrors\b',
    r'\bissue\b', r'\bissues\b',
    r'\bpatch\b', r'\bpatched\b',
    r'\brepair\b', r'\brepaired\b',
    r'\bresolve\b', r'\bresolved\b', r'\bresolves\b',
    r'\bhotfix\b',
    r'\bdefect\b', r'\bdefects\b',
    r'\bcorrect\b', r'\bcorrected\b', r'\bcorrection\b',
    r'\bcrash\b', r'\bcrashes\b', r'\bcrashing\b',
    r'\bfail\b', r'\bfailed\b', r'\bfailing\b', r'\bfailure\b',
    r'\bbroken\b', r'\bbreak\b',
    r'\bnull\s*pointer\b', r'\bnpe\b',
    r'\bexception\b', r'\bexceptions\b',
    r'\bregression\b',
    r'#\d+'
]

def clone_repo(github_url, target_dir):
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)
    subprocess.run(['git', 'clone', github_url, target_dir], check=True)

def get_bug_commits(repo_dir):
    result = subprocess.run(
        ['git', 'log', '--pretty=format:%H|||%s', '--name-only'],
        cwd=repo_dir,
        capture_output=True,
        text=True
    )
    bug_counts = {}
    current_is_bug = False
    bug_pattern = re.compile('|'.join(BUG_KEYWORDS), re.IGNORECASE)
    for line in result.stdout.split('\n'):
        line = line.strip()
        if not line:
            continue
        if '|||' in line:
            parts = line.split('|||', 1)
            if len(parts) == 2:
                commit_msg = parts[1]
                current_is_bug = bool(bug_pattern.search(commit_msg))
        else:
            if current_is_bug and line:
                bug_counts[line] = bug_counts.get(line, 0) + 1
    return bug_counts

def get_commit_counts(repo_dir):
    result = subprocess.run(
        ['git', 'log', '--pretty=format:', '--name-only'],
        cwd=repo_dir,
        capture_output=True,
        text=True
    )
    commit_counts = {}
    for line in result.stdout.split('\n'):
        line = line.strip()
        if line:
            commit_counts[line] = commit_counts.get(line, 0) + 1
    return commit_counts

def count_lines(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return sum(1 for _ in f)
    except:
        return 0

def analyze_smells(filepath):
    smells = {
        'long_file': False,
        'long_functions': 0,
        'deep_nesting': 0,
        'long_lines': 0,
        'low_comments': False
    }
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
    except:
        return smells, 0
    total_lines = len(lines)
    if total_lines > 500:
        smells['long_file'] = True
    comment_lines = 0
    current_indent = 0
    max_indent = 0
    function_start = -1
    function_lengths = []
    function_patterns = re.compile(r'^\s*(def |function |fn |func |public |private |protected |void |int |string |async )')
    for i, line in enumerate(lines):
        stripped = line.rstrip()
        if not stripped:
            continue
        if len(stripped) > 120:
            smells['long_lines'] += 1
        if re.match(r'^\s*(#|//|/\*|\*|<!--)', stripped):
            comment_lines += 1
        indent = len(line) - len(line.lstrip())
        spaces_per_level = 4
        indent_level = indent // spaces_per_level
        if indent_level > max_indent:
            max_indent = indent_level
        if function_patterns.match(line):
            if function_start >= 0:
                func_len = i - function_start
                function_lengths.append(func_len)
            function_start = i
    if function_start >= 0:
        function_lengths.append(total_lines - function_start)
    if max_indent > 4:
        smells['deep_nesting'] = max_indent - 4
    smells['long_functions'] = sum(1 for fl in function_lengths if fl > 50)
    if total_lines > 20 and comment_lines / total_lines < 0.05:
        smells['low_comments'] = True
    smell_score = 0
    if smells['long_file']:
        smell_score += 25
    smell_score += min(smells['long_functions'] * 10, 30)
    smell_score += min(smells['deep_nesting'] * 5, 20)
    smell_score += min(smells['long_lines'], 15)
    if smells['low_comments']:
        smell_score += 10
    return smells, min(smell_score, 100)

def get_file_extension(filepath):
    _, ext = os.path.splitext(filepath)
    return ext.lower() if ext else 'none'

def analyze_codebase(root_dir):
    files_data = []
    skip_dirs = {'.git', 'node_modules', 'vendor', 'target', 'build', 'dist', '__pycache__', '.idea', '.vscode'}
    code_extensions = {
        '.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.go', '.rs', '.c', '.cpp', '.h', '.hpp',
        '.cs', '.rb', '.php', '.swift', '.kt', '.scala', '.clj', '.ex', '.exs', '.erl',
        '.hs', '.ml', '.fs', '.r', '.m', '.mm', '.sh', '.bash', '.zsh', '.zig'
    }
    commit_counts = get_commit_counts(root_dir)
    bug_counts = get_bug_commits(root_dir)
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        rel_dir = os.path.relpath(dirpath, root_dir)
        if rel_dir == '.':
            rel_dir = ''
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            ext = get_file_extension(filename)
            if ext not in code_extensions:
                continue
            loc = count_lines(filepath)
            if loc == 0:
                continue
            rel_path = os.path.join(rel_dir, filename) if rel_dir else filename
            commits = commit_counts.get(rel_path, 1)
            bugs = bug_counts.get(rel_path, 0)
            smells, smell_score = analyze_smells(filepath)
            bug_ratio_score = min(int((bugs / max(commits, 1)) * 50), 30)
            final_smell_score = min(smell_score + bug_ratio_score, 100)
            files_data.append({
                'path': rel_path,
                'name': filename,
                'extension': ext,
                'loc': loc,
                'commits': commits,
                'bugs': bugs,
                'directory': rel_dir,
                'smells': smells,
                'smell_score': final_smell_score
            })
    return sorted(files_data, key=lambda x: x['commits'], reverse=True)

def extract_org_repo(github_url):
    url = github_url.rstrip('/')
    if url.endswith('.git'):
        url = url[:-4]
    parts = url.split('/')
    if len(parts) >= 2:
        return parts[-2], parts[-1]
    return 'unknown', 'unknown'

def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze.py <github_url>")
        sys.exit(1)
    github_url = sys.argv[1]
    target_dir = '/tmp/codecity'
    print(f"Cloning {github_url} (full history)...")
    clone_repo(github_url, target_dir)
    print("Analyzing codebase, git history, and bug-related commits...")
    files_data = analyze_codebase(target_dir)
    total_bugs = sum(f['bugs'] for f in files_data)
    files_with_bugs = len([f for f in files_data if f['bugs'] > 0])
    org, repo = extract_org_repo(github_url)
    output = {
        'repo_url': github_url,
        'org': org,
        'repo': repo,
        'total_files': len(files_data),
        'total_loc': sum(f['loc'] for f in files_data),
        'total_commits': sum(f['commits'] for f in files_data),
        'total_bugs': total_bugs,
        'files_with_bugs': files_with_bugs,
        'files': files_data
    }
    output_filename = f"{org}_{repo}.json"
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, 'data')
    os.makedirs(data_dir, exist_ok=True)
    output_path = os.path.join(data_dir, output_filename)
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)
    files_json_path = os.path.join(data_dir, 'files.json')
    existing_files = []
    if os.path.exists(files_json_path):
        with open(files_json_path, 'r') as f:
            existing_files = json.load(f)
    if output_filename not in existing_files:
        existing_files.append(output_filename)
        with open(files_json_path, 'w') as f:
            json.dump(existing_files, f)
    smelly_files = len([f for f in files_data if f['smell_score'] > 50])
    print(f"Analysis complete: {output['total_files']} files, {output['total_loc']} LOC")
    print(f"Found {total_bugs} bug-related commits affecting {files_with_bugs} files")
    print(f"Found {smelly_files} files with high code smell scores (>50)")
    print(f"Data saved to {output_path}")

if __name__ == '__main__':
    main()
