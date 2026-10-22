// Terminal Engine
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('cli-input');
    const output = document.getElementById('terminal-output');
    const terminalBody = document.getElementById('terminal-body');

    let history = [];
    let historyIndex = -1;
    let portfolioData = null;

    // Load Data JSON
    fetchData();

    async function fetchData() {
        try {
            const res = await fetch('data.json');
            if (!res.ok) throw new Error('HTTP error ' + res.status);
            portfolioData = await res.json();
            showWelcome();
        } catch (err) {
            console.warn('Impossible de charger data.json directement via fetch (probablement testé en file:// local). Utilisation du secours.');
            portfolioData = getFallbackData();
            showWelcome();
        }
    }

    // Input listener
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim();
            if (command !== '') {
                history.push(command);
                historyIndex = history.length;
                handleCommand(command);
            } else {
                appendEcho('');
            }
            input.value = '';
            scrollToBottom();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0 && historyIndex > 0) {
                historyIndex--;
                input.value = history[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                historyIndex++;
                input.value = history[historyIndex];
            } else {
                historyIndex = history.length;
                input.value = '';
            }
        }
    });

    // Keep focus on input when clicking terminal
    document.addEventListener('click', () => {
        input.focus();
    });

    function handleCommand(cmd) {
        appendEcho(cmd);
        const tokens = cmd.toLowerCase().split(' ');
        const mainCmd = tokens[0];

        switch (mainCmd) {
            case 'help':
                cmdHelp();
                break;
            case 'whoami':
            case 'about':
                cmdWhoami();
                break;
            case 'skills':
            case 'tree':
                cmdSkills();
                break;
            case 'projects':
                cmdProjects();
                break;
            case 'certs':
            case 'certifications':
                cmdCerts();
                break;
            case 'contact':
                cmdContact();
                break;
            case 'clear':
                output.innerHTML = '';
                break;
            case 'banner':
                showWelcome();
                break;
            case 'sudo':
                appendOutput('<span class="error-msg">Permission refusée: L\'incident a été signalé à l\'administrateur système. ;)</span>');
                break;
            case 'ls':
                appendOutput('about.txt   skills.json   projects.db   certifications.crt   contact.cfg');
                break;
            case 'cat':
                if (tokens[1] === 'about.txt') cmdWhoami();
                else if (tokens[1] === 'skills.json') cmdSkills();
                else if (tokens[1] === 'contact.cfg') cmdContact();
                else appendOutput('<span class="error-msg">Usage: cat [about.txt | skills.json | contact.cfg]</span>');
                break;
            default:
                appendOutput(`<span class="error-msg">Commande inconnue: '${cmd}'. Tapez <span class="cmd-name">help</span> pour la liste des commandes.</span>`);
        }
    }

    function appendEcho(cmd) {
        const div = document.createElement('div');
        div.className = 'command-echo';
        div.innerHTML = `
            <span class="prompt">
                <span class="user">guest</span><span class="at">@</span><span class="host">sec-ops</span>:<span class="path">~</span><span class="symbol">$</span>
            </span>
            <span>${escapeHtml(cmd)}</span>
        `;
        output.appendChild(div);
    }

    function appendOutput(content) {
        const div = document.createElement('div');
        div.className = 'output-block';
        div.innerHTML = content;
        output.appendChild(div);
    }

    function showWelcome() {
        const banner = `
  ██████╗██╗   ██╗██████╗ ███████╗██████╗ 
 ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
 ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝
 ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗
 ╚██████╗   ██║   ██████╔╝███████╗██║  ██║
  ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝
        `;
        let html = `<pre class="banner">${banner}</pre>`;
        html += `<p>Bienvenue sur le terminal de <strong style="color:var(--accent-cyan);">${portfolioData.personal.name}</strong> [${portfolioData.personal.role}].</p>`;
        html += `<p style="color:var(--text-dim); margin-top:5px;">Tapez <span class="cmd-name">help</span> pour afficher les commandes disponibles.</p><br>`;
        appendOutput(html);
    }

    function cmdHelp() {
        let html = `<p>Commandes système disponibles :</p><div class="help-table">`;
        html += `<div><span class="cmd-name">whoami</span></div><div>Présentation et profil complet</div>`;
        html += `<div><span class="cmd-name">skills</span></div><div>Compétences techniques sous forme d'arborescence</div>`;
        html += `<div><span class="cmd-name">projects</span></div><div>Projets réalisés et dépôts GitHub</div>`;
        html += `<div><span class="cmd-name">certs</span></div><div>Certifications et distinctions</div>`;
        html += `<div><span class="cmd-name">contact</span></div><div>Liens vers mes réseaux et email</div>`;
        html += `<div><span class="cmd-name">clear</span></div><div>Effacer l'écran du terminal</div>`;
        html += `<div><span class="cmd-name">banner</span></div><div>Afficher la bannière d'accueil</div>`;
        html += `</div>`;
        appendOutput(html);
    }

    function cmdWhoami() {
        const p = portfolioData.personal;
        let html = `<p><strong style="color:var(--accent-cyan);">${p.name}</strong></p>`;
        html += `<p>• <strong>Rôle:</strong> ${p.role}</p>`;
        html += `<p>• <strong>Statut:</strong> ${p.status}</p>`;
        html += `<p>• <strong>Localisation:</strong> ${p.location}</p>`;
        appendOutput(html);
    }

    function cmdSkills() {
        let html = `<p class="tree-view">. (skills_root)</p>`;
        for (const [category, list] of Object.entries(portfolioData.skills)) {
            html += `<p class="tree-view">├── <strong>${category}</strong></p>`;
            list.forEach((item, idx) => {
                const isLast = idx === list.length - 1;
                const prefix = isLast ? '│   └── ' : '│   ├── ';
                html += `<p style="color:var(--text-primary);">${prefix}${item}</p>`;
            });
        }
        appendOutput(html);
    }

    function cmdProjects() {
        let html = `<p>Projets récents :</p>`;
        portfolioData.projects.forEach(p => {
            html += `
                <div class="project-card">
                    <div class="project-title">[${p.id}] ${p.name}</div>
                    <div class="project-tech">Tech Stack: ${p.tech}</div>
                    <p>${p.description}</p>
                    <p style="margin-top:4px;">➜ Lien: <a href="${p.link}" target="_blank" class="link">${p.link}</a></p>
                </div>
            `;
        });
        appendOutput(html);
    }

    function cmdCerts() {
        let html = `<p>Certifications & Qualifications :</p><ul>`;
        portfolioData.certifications.forEach(c => {
            html += `<li style="margin-left:20px; color:var(--accent-green);">${c}</li>`;
        });
        html += `</ul>`;
        appendOutput(html);
    }

    function cmdContact() {
        const p = portfolioData.personal;
        let html = `<p>Moyens de me contacter :</p>`;
        html += `<p>• Email    : <a href="mailto:${p.email}" class="link">${p.email}</a></p>`;
        html += `<p>• GitHub   : <a href="${p.github}" target="_blank" class="link">${p.github}</a></p>`;
        html += `<p>• LinkedIn : <a href="${p.linkedin}" target="_blank" class="link">${p.linkedin}</a></p>`;
        html += `<p>• TryHackMe: <a href="${p.tryhackme}" target="_blank" class="link">${p.tryhackme}</a></p>`;
        appendOutput(html);
    }

    function scrollToBottom() {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function getFallbackData() {
        return ${JSON.stringify(data_json, null, 4)};
    }
});
