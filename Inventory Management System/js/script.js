const wrapper = document.querySelector('.wrapper');
const toggle = document.querySelector('#toggle');
const links = document.querySelectorAll('.sidebar ul li a');
const dropdowns = document.querySelectorAll('.sidebar details');
const summaries = document.querySelectorAll('.sidebar summary');

// menu button: expand or collapse
toggle.addEventListener('click', () => {
  wrapper.classList.toggle('collapsed');

  // close dropdowns when the sidebar collapses
  if (wrapper.classList.contains('collapsed')) {
    dropdowns.forEach(d => d.removeAttribute('open'));
  }
});

// clicking an icon while collapsed: expand
links.forEach(link => {
  link.addEventListener('click', (e) => {
    if (wrapper.classList.contains('collapsed')) {
      e.preventDefault();
      wrapper.classList.remove('collapsed');
    }
  });
});

// clicking a dropdown row while collapsed: expand
summaries.forEach(s => {
  s.addEventListener('click', () => {
    wrapper.classList.remove('collapsed');
  });
});

// highlight the link for the page we're on
const currentPage = location.pathname.split('/').pop();
links.forEach(link => {
  const href = link.getAttribute('href');

  if (href && href !== '#' && href === currentPage) {
    link.classList.add('active');

    // if it's inside a dropdown, open it and highlight its title too
    const dropdown = link.closest('details');
    if (dropdown) {
      dropdown.open = true;
      dropdown.querySelector('summary').classList.add('active');
    }
  }
});