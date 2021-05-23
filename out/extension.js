"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const cp = require("child_process");
const execShell = (cmd) => new Promise((resolve, reject) => {
    cp.exec(cmd, (err, out) => {
        if (err) {
            console.log(`Found an error: ${err}`);
            return reject(err);
        }
        return resolve(out);
    });
});
function showInputBox() {
    return __awaiter(this, void 0, void 0, function* () {
        const remote_branch = yield vscode.window.showInputBox({
            value: 'master',
            placeHolder: 'remote branch',
        });
        const result = yield execShell(`git push origin HEAD:refs/for/${remote_branch}`);
        vscode.window.showInformationMessage(`Commit pushed to HEAD:refs/for/${result}`);
    });
}
function getAllBranches() {
    return __awaiter(this, void 0, void 0, function* () {
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        const git = gitExtension === null || gitExtension === void 0 ? void 0 : gitExtension.exports;
        const api = git.getAPI(1);
        const repo = api.repositories[0];
        const head = repo;
        // Get the branch and commit 
        const { commit, name: branch } = head;
        // Get head of any other branch
        console.log(`FOO ${branch}`);
        return branch;
    });
}
function qp() {
    return __awaiter(this, void 0, void 0, function* () {
        const fruits = getAllBranches();
        const code = yield getCode(fruits);
    });
}
function getCode(codes) {
    return new Promise((resolve) => {
        const quickPick = vscode.window.createQuickPick();
        quickPick.placeholder = 'Select (or create) a code.';
        quickPick.canSelectMany = false;
        quickPick.items = codes.map((label) => ({ label }));
        quickPick.onDidAccept(() => {
            const selection = quickPick.activeItems[0];
            resolve(selection.label);
            quickPick.hide();
        });
        quickPick.onDidChangeValue(() => {
            // add a new code to the pick list as the first item
            if (!codes.includes(quickPick.value)) {
                const newItems = [quickPick.value, ...codes].map(label => ({ label }));
                quickPick.items = newItems;
            }
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    });
}
function activate(context) {
    let disposable = vscode.commands.registerCommand('ss.helloWorld', qp);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map