import * as vscode from 'vscode';
import * as cp from "child_process";


const execShell = (cmd: string) =>
    new Promise<string>((resolve, reject) => {
        cp.exec(cmd, (err, out) => {
            if (err) {
                console.log(`Found an error: ${err}`)
                return reject(err);
            }
            return resolve(out);
        });
    });

async function showInputBox() {
    const remote_branch = await vscode.window.showInputBox({
        value: 'master',
        placeHolder: 'remote branch',
    });
}

async function gitAPI(val: string, push_branch="") {
    const gitExtension = vscode.extensions.getExtension('vscode.git')
    const git = gitExtension?.exports
    const api = git.getAPI(1);
    const repo = api.repositories[0];
    if (val == "branch") {
        const branch  = await repo.getBranches("origin");
        return branch
    } else if (val == "push"){
        await repo.push("origin", `HEAD:refs/for/${push_branch}`)
    }
}

async function qp() {
    const branchRaw = await gitAPI("branch")
    const branch: string[] = [];
    branchRaw.forEach(function (value: any) {
        branch.push(value['name'])
      }); 
    const code = await getCode(branch)
}


function getCode(codes: any) {
    return new Promise((resolve) => {
      const quickPick = vscode.window.createQuickPick()
      quickPick.placeholder = 'Select (or create) a code.'
      quickPick.canSelectMany = false
      quickPick.items = codes.map((label: any) => ({ label }))
      quickPick.onDidAccept(async () => {
        const selection = quickPick.activeItems[0]
        resolve(selection.label)
        await gitAPI("push", selection.label)
        vscode.window.showInformationMessage(`Commit pushed to HEAD:refs/for/${selection.label}`);
        quickPick.hide()
      })
      quickPick.onDidChangeValue(() => {
        // add a new code to the pick list as the first item
        if (! codes.includes(quickPick.value)) {
          const newItems = [quickPick.value, ...codes].map(label => ({ label }))
          quickPick.items = newItems
        }
      })
      quickPick.onDidHide(() => quickPick.dispose())
      quickPick.show()
    })
  }
  

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('gerrit.push', qp);
    context.subscriptions.push(disposable);
}
export function deactivate() {}