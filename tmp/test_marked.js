const { marked } = require('marked');

const md = '- [ ] Task 1\n- [x] Task 2';
console.log('--- Default Marked Output ---');
console.log(marked.parse(md));

const renderer = new marked.Renderer();
renderer.listitem = (text, task, checked) => {
  if (task) {
    return `<li class="task-list-item"><input type="checkbox" ${checked ? 'checked' : ''}> ${text}</li>`;
  }
  return `<li>${text}</li>`;
};

console.log('--- Custom Renderer Output ---');
console.log(marked.parse(md, { renderer }));
