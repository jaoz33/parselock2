function mergeRow(templateHtml, row, mapping, placeholders, inheritFormats) {
  const container = document.createElement('div');
  container.innerHTML = templateHtml;
  const textNodes = getTextNodes(container);
  for (const ph of placeholders) {
    const col = mapping[ph];
    const value = col ? String(row[col] ?? '') : '';
    replacePlaceholderRuns(textNodes, ph, value, inheritFormats && inheritFormats[ph]);
  }
  return container.innerHTML;
}

function getTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let node;
  while (node = walker.nextNode()) nodes.push(node);
  return nodes;
}

function replacePlaceholderRuns(textNodes, placeholder, value, inherited) {
  const regex = new RegExp('\{\{\s*' + placeholder.replace(/[\^$.*+?()[\]{}|]/g, '\$&') + '\s*\}\}', 'gi');
  for (const node of textNodes) {
    if (!regex.test(node.textContent)) continue;
    const parent = node.parentElement;
    if (!parent) continue;
    const span = document.createElement('span');
    span.textContent = value;
    if (inherited) {
      if (inherited.bold) span.style.fontWeight = 'bold';
      if (inherited.italic) span.style.fontStyle = 'italic';
      if (inherited.underline) span.style.textDecoration = 'underline';
      if (inherited.strike) span.style.textDecoration = inherited.underline ? 'underline line-through' : 'line-through';
      if (inherited.font) span.style.fontFamily = inherited.font;
      if (inherited.color) span.style.color = inherited.color;
    }
    parent.replaceChild(span, node);
  }
}

export { mergeRow };
