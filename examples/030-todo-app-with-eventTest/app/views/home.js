// views/home.js — Home route
export async function boot({ store, el, signal }){
  const container = document.createElement('main');
  container.style.cssText = 'max-width: 600px; margin: 2rem auto; padding: 0 1rem;';
  container.innerHTML = `
    <h1>Home works!</h1>
    <p>This is the home page of the todo app example.</p>
    <p><a href="/todo-demo" data-link>Go to Todo App Demo →</a></p>
  `;
  el.appendChild(container);
}
