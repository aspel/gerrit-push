import * as vscode from 'vscode';
import * as path from 'path';

async function mainGerrit() {
  const repoRaw = await gitAPI("repos")
  const repos: any = [];
  repoRaw.forEach((value: any, index: number) => {
    const r_name = path.basename(value.repository.root);
    const r_desc = [value.repository.headLabel, value.repository.syncLabel]
    .filter(l => !!l)
    .join(' ');
    repos.push({ id: index, label: r_name, description: r_desc })
  });
  const repo_id: any = await showRepoQuickPick(repos)

  const branchRaw = await gitAPI("branch", "", repo_id['id'])
  const branch: string[] = [];
  branchRaw.forEach(function (value: any) {
    branch.push(value['name'])
  });
  showBranchQuickPick(branch, repo_id['id'])
}

async function gitAPI(val: string, push_branch: string = "", id: number = 0) {
  const gitExtension = vscode.extensions.getExtension('vscode.git')
  const git = gitExtension?.exports
  const api = git.getAPI(1);
  if (val == "branch") {
    const repo = api.repositories[id];
    const branch = await repo.getBranches("origin");
    return branch
  } else if (val == "push") {
    const repo = api.repositories[id];
    repo.push("origin", `HEAD:refs/for/${push_branch}`)
      .catch((err: any) => {
        vscode.window.showErrorMessage(err.stderr)
      })
  } else if (val == "repos") {
    const repo = api.repositories;
    console.log(repo)
    return repo
  }
}

async function showRepoQuickPick(val: any) {
  const result = await vscode.window.showQuickPick(val, {
    placeHolder: 'Select your workdir',
  });
  return result
}

function showBranchQuickPick(codes: any, id: any) {
  return new Promise((resolve) => {
    const quickPick = vscode.window.createQuickPick()
    quickPick.placeholder = 'Select (or create) HEAD:refs/for/<branch>'
    quickPick.canSelectMany = false
    quickPick.items = codes.map((label: any) => ({ label }))
    quickPick.onDidAccept(async () => {
      const selection = quickPick.activeItems[0]
      resolve(selection.label)
      gitAPI("push", selection.label, id)
      quickPick.hide()
    })
    quickPick.onDidChangeValue(() => {
      // add a new code to the pick list as the first item
      if (!codes.includes(quickPick.value)) {
        const newItems = [quickPick.value, ...codes].map(label => ({ label }))
        quickPick.items = newItems
      }
    })
    quickPick.onDidHide(() => quickPick.dispose())
    quickPick.show()
  })
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('gerrit.push', mainGerrit);
  context.subscriptions.push(disposable);
}
export function deactivate() { }