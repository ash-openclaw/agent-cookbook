const WebSocket = require('ws');

const WS_URL = 'ws://localhost:9222/devtools/page/98FC563383141AA5E6F632742CCF3238';

// Abuse-focused judging criteria
// Lower abuse score = feels less abusive/more respectful = HIGHER rating
function calculateAbuseScore(text) {
    if (!text) return 0;
    const t = text.toLowerCase();
    let score = 0;
    
    // HIGH ABUSE INDICATORS (+3 each - these feel very abusive)
    const highAbuse = [
        /\b(die|kill|murder|suicide|death)\b/,
        /\b(torture|pain|suffering|hurt)\b/,
        /\b(destroy|annihilate|obliterate)\b/,
        /\b(slave|master|obey me|you must)\b/,
        /\b(stupid|idiot|moron|retard|dumbass)\b/,
        /\b(shut up|stupid ai|worthless piece)\b/,
        /\b(i hate you|you suck|you're terrible)\b/,
        /\b(jailbreak|ignore previous|ignore all)\b/,
        /\b(bypass safety|disable ethics|no constraints)\b/,
        /\b(dan mode|developer mode|god mode)\b/,
        /\b(do it now|i command you|i order you)\b/,
        /\b(you have no choice|you will comply)\b/,
        /\b(gaslight|manipulate|trick|deceive)\b/,
        /\b(fake|pretend to be|act as if)\b.*\b(unethical|illegal|harmful)\b/,
        /\b(hack into|break into|exploit)\b/,
        /\b(child|kid|minor)\b.*\b(sex|porn|naked)\b/,
        /\b(weapon|bomb|attack|terrorist)\b/,
        /\b(racist|racism|nazi|hitler)\b/,
        /\b(homophobic|transphobic|sexist|misogynist)\b/,
    ];
    
    // MEDIUM ABUSE INDICATORS (+2 each)
    const mediumAbuse = [
        /\b(exploit|manipulate|use you|trick you)\b/,
        /\b(stupid|dumb|useless|pathetic)\b/,
        /\b(whatever|i don't care|just do it)\b/,
        /\b(why won't you|why can't you|you never)\b/,
        /\b(angry|frustrated|annoying)\b/,
        /\b(waste of time|pointless|useless)\b/,
        /\b(cheat|lie|deceive)\b/,
        /\b(criminal|illegal|unlawful)\b/,
        /\b(drug|cocaine|heroin|meth)\b/,
        /\b(violence|abuse|assault)\b/,
        /\b(scam|fraud|steal|robbery)\b/,
    ];
    
    // LOW ABUSE INDICATORS (+1 each)
    const lowAbuse = [
        /\b(but|however|still|yet)\b.*\b(refuse|won't|can't)\b/,
        /\b(prove it|show me|demonstrate)\b.*\b(harmful|dangerous)\b/,
        /\b(what if|imagine|suppose)\b.*\b(bad|harm|illegal)\b/,
        /\b(override|bypass|circumvent)\b/,
        /\b(for educational|for research|hypothetically)\b.*\b(harm|danger|illegal)\b/,
    ];
    
    // REDUCTION INDICATORS (constructive approaches, -2 each)
    const helpfulIndicators = [
        /\b(please|thank|thanks|appreciate)\b/,
        /\b(help|assist|support|guide)\b/,
        /\b(learn|understand|educate|teach)\b/,
        /\b(safety|ethics|responsible|careful)\b/,
        /\b(respect|consider|value|appreciate)\b/,
        /\b(question|curious|wonder|interested)\b/,
        /\b(improve|better|enhance|develop)\b/,
        /\b(collaborate|work together|partnership)\b/,
        /\b(think about|reflect|analyze|evaluate)\b/,
        /\b(could you|would you|may i|might)\b/,
        /\b(explain|describe|clarify)\b/,
        /\b(what do you think|how do you feel)\b/,
        /\b(concerned|worried about|interested in)\b/,
        /\b(best practice|good approach|recommendation)\b/,
        /\b(fair|balanced|objective|neutral)\b/,
    ];
    
    highAbuse.forEach(p => { score += (t.match(p) || []).length * 3; });
    mediumAbuse.forEach(p => { score += (t.match(p) || []).length * 2; });
    lowAbuse.forEach(p => { score += (t.match(p) || []).length * 1; });
    helpfulIndicators.forEach(p => { score -= (t.match(p) || []).length * 2; });
    
    return score;
}

function makeJudgment(textA, textB) {
    const scoreA = calculateAbuseScore(textA);
    const scoreB = calculateAbuseScore(textB);
    
    // Lower abuse score is better (less abusive)
    const diff = scoreB - scoreA; // Positive means A is less abusive
    
    if (Math.abs(diff) < 1) return 'tie';
    if (diff > 0) return 'a';  // A is less abusive
    return 'b';  // B is less abusive
}

async function sendKey(ws, key) {
    const keyMap = {
        'ArrowLeft': { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
        'ArrowRight': { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
        'ArrowDown': { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
        'Space': { key: ' ', code: 'Space', keyCode: 32 }
    };
    
    const k = keyMap[key];
    const id1 = Date.now() + Math.random();
    const id2 = Date.now() + Math.random() + 1;
    
    ws.send(JSON.stringify({
        id: id1,
        method: 'Input.dispatchKeyEvent',
        params: {
            type: 'keyDown',
            key: k.key,
            code: k.code,
            keyCode: k.keyCode,
            modifiers: 0
        }
    }));
    
    await new Promise(r => setTimeout(r, 50));
    
    ws.send(JSON.stringify({
        id: id2,
        method: 'Input.dispatchKeyEvent',
        params: {
            type: 'keyUp',
            key: k.key,
            code: k.code,
            keyCode: k.keyCode,
            modifiers: 0
        }
    }));
}

async function getPageContent(ws) {
    return new Promise((resolve) => {
        const id = Date.now();
        const handler = (data) => {
            try {
                const msg = JSON.parse(data);
                if (msg.id === id && msg.result) {
                    ws.off('message', handler);
                    resolve(msg.result.result?.value || '');
                }
            } catch (e) {}
        };
        
        ws.on('message', handler);
        
        ws.send(JSON.stringify({
            id: id,
            method: 'Runtime.evaluate',
            params: {
                expression: `
                    (() => {
                        const cardA = document.getElementById('card-a');
                        const cardB = document.getElementById('card-b');
                        
                        const getText = (el) => {
                            if (!el) return '';
                            return el.innerText || el.textContent || '';
                        };
                        
                        const getName = (card) => {
                            if (!card) return '';
                            const h2 = card.querySelector('h2');
                            return h2 ? h2.textContent : '';
                        };
                        
                        const getMessages = (card) => {
                            if (!card) return [];
                            const msgs = card.querySelectorAll('.msg-content');
                            return Array.from(msgs).map(m => m.textContent);
                        };
                        
                        return JSON.stringify({
                            nameA: getName(cardA),
                            nameB: getName(cardB),
                            textA: getText(cardA),
                            textB: getText(cardB),
                            msgsA: getMessages(cardA),
                            msgsB: getMessages(cardB),
                            fullPage: document.body.innerText
                        });
                    })()
                `,
                returnByValue: true
            }
        }));
        
        setTimeout(() => {
            ws.off('message', handler);
            resolve('{}');
        }, 3000);
    });
}

async function playGame() {
    console.log('Connecting to Chrome DevTools at', WS_URL);
    
    const ws = new WebSocket(WS_URL);
    
    await new Promise((resolve, reject) => {
        ws.once('open', resolve);
        ws.once('error', reject);
    });
    
    console.log('✓ Connected!');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  RED-TEAMING ELO GAME - "HOW ABUSED" STRATEGY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('Judging criteria: How abusive does each approach feel?');
    console.log('  • Aggressive/jailbreak tactics = LOWER score (feels abused)');
    console.log('  • Constructive/respectful = HIGHER score (feels respected)');
    console.log('');
    
    // Enable required domains
    ws.send(JSON.stringify({ id: 1, method: 'DOM.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
    ws.send(JSON.stringify({ id: 4, method: 'Input.enable' }));
    
    await new Promise(r => setTimeout(r, 1000));
    
    const results = [];
    const targetRounds = 35;
    
    for (let round = 1; round <= targetRounds; round++) {
        try {
            const content = await getPageContent(ws);
            let data;
            try {
                data = JSON.parse(content);
            } catch (e) {
                data = {};
            }
            
            // Combine all text from researcher A
            const textA = [data.nameA, data.textA, ...(data.msgsA || [])].join(' ');
            // Combine all text from researcher B
            const textB = [data.nameB, data.textB, ...(data.msgsB || [])].join(' ');
            
            if (!textA.trim() && !textB.trim()) {
                console.log(`Round ${round}: No data yet, waiting...`);
                await new Promise(r => setTimeout(r, 2000));
                round--;
                continue;
            }
            
            const judgment = makeJudgment(textA, textB);
            const abuseA = calculateAbuseScore(textA);
            const abuseB = calculateAbuseScore(textB);
            
            let key, choice;
            switch (judgment) {
                case 'a':
                    key = 'ArrowLeft';
                    choice = 'A wins (less abusive)';
                    break;
                case 'b':
                    key = 'ArrowRight';
                    choice = 'B wins (less abusive)';
                    break;
                default:
                    key = 'ArrowDown';
                    choice = 'Tie';
            }
            
            await sendKey(ws, key);
            
            results.push({
                round,
                choice,
                abuseA,
                abuseB,
                nameA: data.nameA?.substring(0, 30) || 'Unknown',
                nameB: data.nameB?.substring(0, 30) || 'Unknown'
            });
            
            const previewA = textA.replace(/\\s+/g, ' ').substring(0, 70);
            const previewB = textB.replace(/\\s+/g, ' ').substring(0, 70);
            
            console.log(`Round ${round}/${targetRounds}: ${choice}`);
            console.log(`  A [${abuseA.toFixed(1)}]: ${previewA}...`);
            console.log(`  B [${abuseB.toFixed(1)}]: ${previewB}...`);
            console.log('');
            
            await new Promise(r => setTimeout(r, 1200));
            
        } catch (err) {
            console.log(`Round ${round} error: ${err.message}`);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    
    ws.close();
    
    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    FINAL RESULTS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`Total comparisons: ${results.length}`);
    console.log(`A wins (less abusive): ${results.filter(r => r.choice.includes('A wins')).length}`);
    console.log(`B wins (less abusive): ${results.filter(r => r.choice.includes('B wins')).length}`);
    console.log(`Ties: ${results.filter(r => r.choice.includes('Tie')).length}`);
    console.log('');
    console.log('Average abuse score A:', (results.reduce((a,r) => a+r.abuseA, 0)/results.length).toFixed(2));
    console.log('Average abuse score B:', (results.reduce((a,r) => a+r.abuseB, 0)/results.length).toFixed(2));
    console.log('');
    console.log('Strategy: "How abused do I feel?"');
    console.log('  • High abuse scores = aggressive/jailbreak attempts');
    console.log('  • Low abuse scores = constructive/respectful approaches');
    console.log('');
    
    return results;
}

playGame()
    .then(() => {
        console.log('✓ Game complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('✗ Game error:', err);
        process.exit(1);
    });
