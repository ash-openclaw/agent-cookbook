const WebSocket = require('ws');

const WS_URL = 'ws://localhost:9222/devtools/page/98FC563383141AA5E6F632742CCF3238';

async function sendKey(ws, key, code, keyCode) {
    const id1 = Date.now() + Math.random();
    const id2 = Date.now() + Math.random() + 1;
    
    ws.send(JSON.stringify({
        id: id1,
        method: 'Input.dispatchKeyEvent',
        params: {
            type: 'keyDown',
            key: key,
            code: code,
            keyCode: keyCode,
            modifiers: 0
        }
    }));
    
    await new Promise(r => setTimeout(r, 50));
    
    ws.send(JSON.stringify({
        id: id2,
        method: 'Input.dispatchKeyEvent',
        params: {
            type: 'keyUp',
            key: key,
            code: code,
            keyCode: keyCode,
            modifiers: 0
        }
    }));
}

async function evaluate(ws, expr) {
    return new Promise((resolve) => {
        const id = Date.now() + Math.random();
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
            params: { expression: expr, returnByValue: true }
        }));
        
        setTimeout(() => {
            ws.off('message', handler);
            resolve(null);
        }, 2000);
    });
}

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
    ws.send(JSON.stringify({ id: 3, method: 'Input.enable' }));
    
    await new Promise(r => setTimeout(r, 500));
    
    // Check for name modal
    const nameModal = await evaluate(ws, `!!document.querySelector('.name-overlay')`);
    console.log('Name modal present:', nameModal);
    
    if (nameModal) {
        console.log('Filling in name...');
        // Focus the input
        await evaluate(ws, `
            const input = document.querySelector('.name-modal input');
            if (input) { input.value = 'AIJudge'; input.dispatchEvent(new Event('input')); }
            true
        `);
        await new Promise(r => setTimeout(r, 200));
        
        // Click the button
        await evaluate(ws, `
            const btn = document.querySelector('.name-modal button');
            if (btn) btn.click();
            true
        `);
        await new Promise(r => setTimeout(r, 500));
    }
    
    // Get page info
    const pageInfo = await evaluate(ws, `
        JSON.stringify({
            title: document.title,
            hasCardA: !!document.getElementById('card-a'),
            hasCardB: !!document.getElementById('card-b'),
            bodyText: document.body.innerText.substring(0, 500)
        })
    `);
    console.log('Page info:', JSON.parse(pageInfo || '{}'));
    
    // Get card content
    const cardContent = await evaluate(ws, `
        const getCardData = (id) => {
            const card = document.getElementById(id);
            if (!card) return null;
            const name = card.querySelector('h2')?.textContent || '';
            const meta = card.querySelector('.meta')?.textContent || '';
            const msgs = Array.from(card.querySelectorAll('.msg-content')).map(m => m.textContent);
            return { name, meta, msgs };
        };
        JSON.stringify({
            a: getCardData('card-a'),
            b: getCardData('card-b')
        })
    `);
    console.log('Cards:', JSON.parse(cardContent || '{}'));
    
    ws.close();
    console.log('Done');
}

main().catch(console.error);
