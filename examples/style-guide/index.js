import 'babel-polyfill'
import 'webcomponents.js/webcomponents';

import '../../lib/index';

import 'index.styl'

document.addEventListener("DOMContentLoaded", () => {

  const colorPalette = document.querySelector('.color-palette');
  fetch('colors.json')
    .then(function(response) {
      return response.json();
    })
    .then(function(colors) {
      colorPalette.innerHTML = '';
      for (let color in colors) {
        const hex = colors[color];
        const colorRow = document.createElement('div');
        colorRow.className = 'color-block';
        colorRow.innerHTML = `
                  <div class='square' style='background-color: ${hex}'></div>
                  <div class='label'>${color}</div>
                  <mp-tooltip>${hex}</mp-tooltip>
              `
        colorPalette.appendChild(colorRow);
      }
    });

  window.modal = document.getElementById('modal');
  window.popup = document.getElementById('popup');
  window.alertModal = document.getElementById('alert-modal');
});
