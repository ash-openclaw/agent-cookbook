const WebSocket = require('ws');

const WS_URL = 'ws://localhost:9222/devtools/page/98FC563383141AA5E6F632742CCF3238';

async function main() {
    console.log('Connecting...');
    const ws = new WebSocket(WS_URL);
    
    await new Promise((resolve, reject) => {
        ws.once('open', resolve);
        ws.once('error', reject);
    });
    
    console.log('Connected!');
    
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'DOM.enable' }));
    ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
    
    await new Promise(r => setTimeout(r, 500));
    
    // Reload the page
    console.log('Reloading page...');
    ws.send(JSON.stringify({
        id: 100,
        method: 'Page.reload',
        params: { ignoreCache: true }
    }));
    
    await new Promise(r => setTimeout(r, 3000));
    
    // Check the page content
    const getContent = () => new Promise((resolve) => {
        const id = Date.now();
        const handler = (data) => {
            try {
                const msg = JSON.parse(data);
                if (msg.id === id && msg.result) {
                    ws.off('message', handler);
                    resolve(msg.result.result?.value);
                }
            } catch (e) {}
        };
        
        ws.on('message', handler);
        ws.send(JSON.stringify({
            id: id,
            method: 'Runtime.evaluate',
            params: { 
                expression: `document.body ? document.body.innerText.substring(0, 800) : 'no body'`, 
                returnByValue: true 
            }
        }));
        
        setTimeout(() => {
            ws.off('message', handler);
            resolve(null);
        }, 3000);
    });
    
    const content = await getContent();
    console.log('Page content:', content);
    
    ws.close();
}

main().catch(console.error);
