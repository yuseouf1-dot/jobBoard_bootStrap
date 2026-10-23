const API_URL = 'http://localhost:3000';

const statusEl = document.getElementById('status');
const listEl = document.getElementById('ad-list');
const detailEl = document.getElementById('ad-detail');

// Creates an element with optional class and text (textContent avoids HTML injection).
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
}

// GET a JSON resource from the API, throwing on non-2xx statuses.
async function getJson(path) {
    const res = await fetch(API_URL + path);
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
    return body;
}

// Page load: fetch the list of ads and render one card per ad.
async function loadAds() {
    try {
        const ads = await getJson('/ads');
        statusEl.textContent = ads.length ? '' : 'No ads yet.';
        listEl.replaceChildren(...ads.map(renderCard));
    } catch (err) {
        statusEl.textContent = `Could not load ads: ${err.message}. Is the API running?`;
        statusEl.className = 'error';
    }
}

function renderCard(ad) {
    const card = el('li', 'ad-card');
    card.dataset.id = ad.id;
    card.append(
        el('h3', null, ad.title),
        el('p', 'company', ad.company),
        el('p', 'short', ad.short_description),
    );

    // type="button" so the click never submits or navigates anywhere.
    const button = el('button', null, 'View details');
    button.type = 'button';
    button.addEventListener('click', () => showDetail(ad.id));
    card.append(button);

    return card;
}

// "View details": fetch one ad and update the side panel, without reloading the page.
async function showDetail(id) {
    for (const card of listEl.children) {
        card.classList.toggle('selected', card.dataset.id === String(id));
    }
    detailEl.hidden = false;
    detailEl.replaceChildren(el('p', null, 'Loading...'));

    try {
        const ad = await getJson(`/ads/${id}`);

        const fields = el('dl');
        const rows = [
            ['Company', ad.company],
            ['Category', ad.category],
            ['Location', ad.location],
            ['Salary', ad.salary],
            ['Posted', new Date(ad.created_at).toLocaleDateString()],
        ];
        for (const [label, value] of rows) {
            fields.append(el('dt', null, label), el('dd', null, value || '-'));
        }

        detailEl.replaceChildren(
            el('h2', null, ad.title),
            el('p', null, ad.description || ad.short_description),
            fields,
        );
    } catch (err) {
        detailEl.replaceChildren(el('p', 'error', `Could not load ad: ${err.message}`));
    }
}

loadAds();
