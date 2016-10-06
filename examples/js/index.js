const colorPalette = document.querySelector('.color-palette');
fetch('colors.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(colors) {
    colorPalette.innerHTML = '';
    for (color in colors) {
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

var modal = document.getElementById('modal');
var popup = document.getElementById('popup');
var alertModal = document.getElementById('alert-modal');
var purpleModal = document.getElementById('purple-modal');

var openPurpleModal = function() {
  purpleModal.open();
  return false;
};

var closePurpleModal = function() {
  purpleModal.close();
};

var openModal = function() {
  modal.open();
  return false;
};

var closeModal = function() {
  modal.close().then(function() {
    console.log('modal!');
  });
}

var openPopup = function() {
  popup.open();
  return false;
};

var closePopup = function() {
  popup.close();
};

var openAlertModal = function() {
  alertModal.open();
  return false;
};

var closeAlertModal = function() {
  alertModal.close();
};
