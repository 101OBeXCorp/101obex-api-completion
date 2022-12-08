"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const axios_1 = require("axios");
const os = require("os");
const url = "https://api.101obex.com:3001/info_extension?developer_token=";
const userHomeDir = os.homedir();
const configFile = userHomeDir + '/.101obex/config.json';
const axiosConfig = {
    headers: {
        accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept-Encoding': 'identity'
    },
    data: {}
};
function activate(context) {
    fs.readFile(configFile, 'utf8', (err, data) => {
        if (err) {
            vscode.window.showErrorMessage('101OBeX Developer Token was not found. ' +
                'Please use 101obexcli to get your 101OBeX Developer Token');
            throw err;
        }
        var dataObj = JSON.parse(data.replace(/\'/g, "\""));
        axios_1.default.get(url + dataObj.id_token, axiosConfig)
            .then((response) => {
            vscode.window.showInformationMessage('101OBeX API Completion activated');
            const provider1 = vscode.languages.registerCompletionItemProvider('python', {
                provideCompletionItems(document, position, token, context) {
                    // a simple completion item which inserts `Hello World!`
                    // a completion item that inserts its text as snippet,
                    // the `insertText`-property is a `SnippetString` which will be
                    // honored by the editor.
                    const snippetCompletion = new vscode.CompletionItem('Good part of the day');
                    snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
                    const docs = new vscode.MarkdownString("Inserts a snippet that lets you select [link](x.ts).");
                    snippetCompletion.documentation = docs;
                    docs.baseUri = vscode.Uri.parse('http://example.com/a/b/c/');
                    // a completion item that can be accepted by a commit character,
                    // the `commitCharacters`-property is set which means that the completion will
                    // be inserted and then the character will be typed.
                    const commitCharacterCompletion = new vscode.CompletionItem('console');
                    commitCharacterCompletion.commitCharacters = ['.'];
                    commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');
                    // a completion item that retriggers IntelliSense when being accepted,
                    // the `command`-property is set which the editor will execute after 
                    // completion has been inserted. Also, the `insertText` is set so that 
                    // a space is inserted after `new`
                    const commandCompletion = new vscode.CompletionItem('new');
                    commandCompletion.kind = vscode.CompletionItemKind.Keyword;
                    commandCompletion.insertText = 'new ';
                    commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };
                    // return all completion items as array
                    var resultado = [
                        snippetCompletion,
                        commitCharacterCompletion,
                        commandCompletion
                    ];
                    response.data.data[0].services.forEach((subelement) => {
                        resultado.push(new vscode.CompletionItem(subelement.description));
                    });
                    return resultado;
                }
            });
            context.subscriptions.push(provider1);
        })
            .catch((error) => {
            if ('success' in error.response.data) {
                vscode.window.showErrorMessage('Your Token is not a valid Token.');
            }
            else {
                vscode.window.showErrorMessage('101OBeX Server is not responding.');
            }
        });
    });
    const provider2 = vscode.languages.registerCompletionItemProvider('plaintext', {
        provideCompletionItems(document, position) {
            // get all text until the `position` and check if it reads `console.`
            // and if so then complete if `log`, `warn`, and `error`
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            if (!linePrefix.endsWith('console.')) {
                return undefined;
            }
            return [
                new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
                new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
                new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
            ];
        }
    }, '.' // triggered whenever a '.' is being typed
    );
    context.subscriptions.push(provider2);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map