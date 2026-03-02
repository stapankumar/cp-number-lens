const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function activate(context) {
    console.log('Number Lens for Competitive Programmers is now active!');

    let command = vscode.commands.registerCommand('cp-number-lens.openPanel', function () {
        const panel = vscode.window.createWebviewPanel(
            'cpNumberLens',
            'Number Lens for Competitive Programmers',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, 'media')
                ]
            }
        );

        //get URIs for css and js so webview can load them
        const cssUri = panel.webview.asWebviewUri(
            vscode.Uri.joinPath(context.extensionUri, 'media', 'panel.css')
        );
        const jsUri = panel.webview.asWebviewUri(
            vscode.Uri.joinPath(context.extensionUri, 'media', 'panel.js')
        );

        //read html file and inject css and js URIs
        const htmlPath = path.join(context.extensionPath, 'media', 'panel.html');
        let html = fs.readFileSync(htmlPath, 'utf8');
        html = html.replace('{{cssUri}}', cssUri);
        html = html.replace('{{jsUri}}', jsUri);

        panel.webview.html = html;
    });

    context.subscriptions.push(command);
}

function deactivate() {}
module.exports = { activate, deactivate };