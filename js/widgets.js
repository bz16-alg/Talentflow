const Widgets = {
  escapeHTML(str) {
    return String(str ?? '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  },

  toast(message, type) {
    type = type || 'info';
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };
    const toastEl = document.createElement('div');
    toastEl.className = 'toast toast-' + type;
    const icon = document.createElement('i');
    icon.className = 'fa-solid toast-icon ' + (icons[type] || icons.info);
    const text = document.createElement('span');
    text.innerHTML = message;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast-close';
    close.setAttribute('aria-label', 'Fermer');
    close.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    const remove = function () {
      toastEl.classList.add('hiding');
      setTimeout(function () { toastEl.remove(); }, 200);
    };
    close.addEventListener('click', remove);
    toastEl.append(icon, text, close);
    container.appendChild(toastEl);
    setTimeout(remove, 4500);
  },

  modal(opts) {
    opts = opts || {};
    const old = document.querySelector('.modal-overlay');
    if (old) old.remove();
    return new Promise(function (resolve) {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      const modalEl = document.createElement('div');
      modalEl.className = 'modal';
      const header = document.createElement('div');
      header.className = 'modal-header';
      const title = document.createElement('h3');
      title.textContent = opts.title || '';
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'btn btn-icon btn-outline modal-close';
      closeBtn.setAttribute('aria-label', 'Fermer');
      closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      header.append(title, closeBtn);
      const body = document.createElement('div');
      body.className = 'modal-body';
      body.innerHTML = opts.bodyHTML || '';
      const footer = document.createElement('div');
      footer.className = 'modal-footer';
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'btn btn-outline';
      cancelBtn.textContent = opts.cancelText || 'Annuler';
      const confirmBtn = document.createElement('button');
      confirmBtn.type = 'button';
      confirmBtn.className = 'btn btn-primary';
      confirmBtn.textContent = opts.confirmText || 'Confirmer';
      let settled = false;
      const finish = function (result) {
        if (settled) return;
        settled = true;
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        resolve(result);
      };
      const onKey = function (e) {
        if (e.key === 'Escape') finish(false);
      };
      closeBtn.addEventListener('click', function () { finish(false); });
      cancelBtn.addEventListener('click', function () { finish(false); });
      confirmBtn.addEventListener('click', function () { finish(true); });
      overlay.addEventListener('mousedown', function (e) {
        if (e.target === overlay) finish(false);
      });
      if (opts.hideCancel) cancelBtn.classList.add('d-none');
      footer.append(cancelBtn, confirmBtn);
      modalEl.append(header, body, footer);
      overlay.appendChild(modalEl);
      document.body.appendChild(overlay);
      document.addEventListener('keydown', onKey);
      confirmBtn.focus();
    });
  },

  confirm(message, title) {
    return Widgets.modal({
      title: title || 'Confirmation',
      bodyHTML: '<p class="mb-0">' + Widgets.escapeHTML(message) + '</p>'
    });
  },

  renderTable(container, opts) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    const columns = opts.columns || [];
    const rows = opts.rows || [];
    const wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    const table = document.createElement('table');
    table.className = 'table';
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    columns.forEach(function (col) {
      const th = document.createElement('th');
      th.textContent = col.label || col.key || '';
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    const tbody = document.createElement('tbody');
    if (!rows.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = Math.max(1, columns.length);
      td.innerHTML = '<div class="empty-state"><i class="fa-regular fa-folder-open"></i><p class="text-muted">' + Widgets.escapeHTML(opts.emptyText || 'Aucune donnée') + '</p></div>';
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      rows.forEach(function (row) {
        const tr = document.createElement('tr');
        columns.forEach(function (col) {
          const td = document.createElement('td');
          if (typeof col.render === 'function') {
            td.innerHTML = col.render(row);
          } else {
            td.textContent = row[col.key];
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }
    table.append(thead, tbody);
    wrap.appendChild(table);
    el.innerHTML = '';
    el.appendChild(wrap);
  },

  badge(status) {
    const map = {
      new: 'blue',
      screened: 'blue',
      interview: 'purple',
      rejected: 'red',
      offered: 'orange',
      hired: 'green',
      draft: 'gray',
      published: 'green',
      closed: 'gray',
      scheduled: 'blue',
      completed: 'green',
      cancelled: 'red',
      pending: 'gray',
      failed: 'red',
      in_progress: 'blue',
      accepted: 'green',
      refused: 'red',
      negotiating: 'orange'
    };
    const color = map[status] || 'gray';
    let label = typeof t === 'function' ? t('status.' + status) : undefined;
    if (!label) label = status || '';
    return '<span class="badge badge-' + color + '">' + Widgets.escapeHTML(String(label)) + '</span>';
  },

  avatar(fullName, sizeClass) {
    const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    const initials = parts.length
      ? parts.slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join('')
      : '?';
    return '<span class="avatar ' + (sizeClass || '') + '">' + Widgets.escapeHTML(initials) + '</span>';
  },

  formatDate(isoOrDate) {
    if (!isoOrDate) return '';
    if (typeof isoOrDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) {
      const parts = isoOrDate.split('-');
      return parts[2] + '/' + parts[1] + '/' + parts[0];
    }
    const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return dd + '/' + mm + '/' + d.getFullYear();
  },

  formatDateTime(iso) {
    if (!iso) return '';
    const d = iso instanceof Date ? iso : new Date(iso);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return dd + '/' + mm + '/' + d.getFullYear() + ' ' + hh + ':' + mi;
  },

  chart(canvas, opts) {
    if (typeof window === 'undefined' || !window.Chart) return null;
    const c = typeof canvas === 'string' ? document.querySelector(canvas) : canvas;
    if (!c) return null;
    if (c._tfChart) c._tfChart.destroy();
    opts = opts || {};
    const cfg = {
      type: opts.type || 'bar',
      data: { labels: opts.labels || [], datasets: opts.datasets || [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    };
    if (opts.options) cfg.options = Object.assign({}, cfg.options, opts.options);
    c._tfChart = new window.Chart(c, cfg);
    return c._tfChart;
  },

  calendar(el, opts) {
    if (typeof window === 'undefined' || !window.FullCalendar) return null;
    const target = typeof el === 'string' ? document.querySelector(el) : el;
    if (!target) return null;
    const cal = new window.FullCalendar.Calendar(target, {
      locale: 'fr',
      headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' },
      events: (opts && opts.events) || [],
      eventClick: function (info) {
        if (opts && typeof opts.onEventClick === 'function') opts.onEventClick(info.event);
      }
    });
    cal.render();
    return cal;
  },

  initPDFViewer(el, url) {
    if (typeof window === 'undefined' || !window.pdfjsLib) return { destroy: function () {} };
    const container = typeof el === 'string' ? document.querySelector(el) : el;
    if (!container) return { destroy: function () {} };
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'pdf-viewer';
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-canvas';
    const toolbar = document.createElement('div');
    toolbar.className = 'pdf-toolbar';
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'btn btn-sm btn-outline';
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i> Précédent';
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn btn-sm btn-outline';
    nextBtn.innerHTML = 'Suivant <i class="fa-solid fa-chevron-right"></i>';
    const pageLabel = document.createElement('span');
    pageLabel.className = 'pdf-pages';
    toolbar.append(prevBtn, pageLabel, nextBtn);
    wrap.append(canvas, toolbar);
    container.appendChild(wrap);
    let pdfDoc = null;
    let pageNum = 1;
    let destroyed = false;
    const renderPage = function (num) {
      if (!pdfDoc || destroyed) return;
      pdfDoc.getPage(num).then(function (page) {
        if (destroyed) return;
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        page.render({ canvasContext: ctx, viewport: viewport });
      }).catch(function () {});
      pageLabel.textContent = pageNum + ' / ' + pdfDoc.numPages;
      prevBtn.disabled = pageNum <= 1;
      nextBtn.disabled = pageNum >= pdfDoc.numPages;
    };
    prevBtn.addEventListener('click', function () {
      if (pageNum > 1) {
        pageNum--;
        renderPage(pageNum);
      }
    });
    nextBtn.addEventListener('click', function () {
      if (pdfDoc && pageNum < pdfDoc.numPages) {
        pageNum++;
        renderPage(pageNum);
      }
    });
    window.pdfjsLib.getDocument(url).promise.then(function (doc) {
      if (destroyed) return;
      pdfDoc = doc;
      renderPage(1);
    }).catch(function () {
      if (destroyed) return;
      container.innerHTML = '<div class="empty-state"><i class="fa-regular fa-file-pdf"></i><p class="text-muted">Impossible de charger le document</p></div>';
    });
    return {
      destroy: function () {
        destroyed = true;
        if (wrap.parentNode) wrap.remove();
      }
    };
  },

  generatePDF(htmlContent, filename) {
    const w = window.open('', '_blank');
    if (!w) return;
    const css = [
      '*{box-sizing:border-box}',
      'body{font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-size:13px;color:#1e293b;line-height:1.5;margin:0;padding:24px;background:#fff}',
      'h1,h2,h3,h4{color:#0f172a;margin:0 0 8px}',
      'h1{font-size:20px}h2{font-size:17px}h3{font-size:15px}',
      'p{margin:0 0 10px}',
      'table{width:100%;border-collapse:collapse;margin:12px 0}',
      'th{text-align:left;padding:8px 10px;background:#f1f5f9;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;border-bottom:2px solid #e2e8f0}',
      'td{padding:8px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top}',
      '.badge{display:inline-block;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:600}',
      '.badge-blue{background:#eff6ff;color:#1d4ed8}.badge-green{background:#f0fdf4;color:#16a34a}.badge-red{background:#fef2f2;color:#dc2626}.badge-orange{background:#fffbeb;color:#d97706}.badge-gray{background:#f1f5f9;color:#64748b}.badge-purple{background:#f5f3ff;color:#7c3aed}',
      '.text-muted{color:#64748b}',
      '.text-right{text-align:right}',
      '.mb-16{margin-bottom:16px}.mb-24{margin-bottom:24px}',
      '.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}',
      '.section-title{font-size:16px;font-weight:700;border-bottom:2px solid #2563eb;padding-bottom:6px;margin:24px 0 12px}',
      '.mt-24{margin-top:24px}',
      '.d-none{display:none}',
      '@media print{body{padding:0}}'
    ].join('');
    w.document.write('<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>' + Widgets.escapeHTML(filename || 'Document') + '</title><style>' + css + '</style></head><body>' + htmlContent + '</body></html>');
    w.document.close();
    w.focus();
    setTimeout(function () { w.print(); }, 300);
  },

  applyTranslations() {
    if (typeof t !== 'function') return;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val != null && val !== '') el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val != null && val !== '') el.setAttribute('placeholder', val);
    });
  },

  debounce(fn, ms) {
    let timer;
    return function () {
      const args = arguments;
      const self = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  },

  emptyState(container, icon, text) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    el.innerHTML = '<div class="empty-state"><i class="' + icon + '"></i><p class="text-muted">' + Widgets.escapeHTML(text || '') + '</p></div>';
  },

  statCard(data) {
    data = data || {};
    const isHex = typeof data.color === 'string' && /^#/.test(data.color);
    const iconClass = isHex ? '' : ' stat-icon-' + (data.color || 'blue');
    const styleAttr = isHex ? ' style="background:' + data.color + ';color:#fff"' : '';
    return '<div class="stat-card">' +
      '<div class="stat-icon' + iconClass + '"' + styleAttr + '><i class="fa-solid ' + (data.icon || 'fa-chart-simple') + '"></i></div>' +
      '<div><div class="stat-value">' + Widgets.escapeHTML(String(data.value ?? '')) + '</div>' +
      '<div class="stat-label">' + Widgets.escapeHTML(data.label || '') + '</div></div></div>';
  },

  setActiveNav(page) {
    document.querySelectorAll('.sidebar-link[data-page]').forEach(function (link) {
      link.classList.remove('active');
    });
    const link = document.querySelector('.sidebar-link[data-page="' + page + '"]');
    if (link) link.classList.add('active');
  },

  initSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (!sidebar) return;
    document.querySelectorAll('[data-sidebar-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const open = sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('open', open);
      });
    });
    if (overlay) {
      overlay.addEventListener('click', function () {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      });
    }
  }
};
