function getSelectedValue(containerId) {
  const selected = document.querySelector(`#${containerId} .selected`);
  return selected ? parseInt(selected.value) : -1;
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(price * 100000).replace('₹', '₹ ');
}

function showLoadingState() {
  const btn = document.getElementById('estimateBtn');
  const originalText = btn.innerHTML;

  btn.innerHTML = `
    <span class="loading-spinner"></span>
    <span>Calculating...</span>
  `;
  btn.disabled = true;
  btn.style.opacity = '0.7';

  const style = document.createElement('style');
  style.textContent = `
    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  return () => {
    btn.innerHTML = originalText;
    btn.disabled = false;
    btn.style.opacity = '1';
    document.head.removeChild(style);
  };
}

function showErrorState(message) {
  const priceDisplay = document.getElementById('uiEstimatedPrice');
  priceDisplay.innerHTML = `
    <div class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>Oops! Something went wrong</h3>
      <p>${message}</p>
      <button onclick="resetPriceDisplay()" class="retry-btn">Try Again</button>
    </div>
  `;
}

function resetPriceDisplay() {
  const priceDisplay = document.getElementById('uiEstimatedPrice');
  priceDisplay.innerHTML = `
    <div class="price-placeholder">
      <span class="placeholder-icon">💰</span>
      <p>Enter property details and click "Estimate Price" to get your prediction</p>
    </div>
  `;
}

function validateInputs() {
  const sqft = document.getElementById('uiSqft').value;
  const bhk = getSelectedValue('uiBHKOptions');
  const bath = getSelectedValue('uiBathOptions');
  const location = document.getElementById('uiLocations').value;

  const errors = [];

  if (!sqft || sqft < 100) errors.push('Please enter a valid area (minimum 100 sq ft)');
  if (bhk === -1) errors.push('Please select number of bedrooms');
  if (bath === -1) errors.push('Please select number of bathrooms');
  if (!location || location === 'Loading locations...') errors.push('Please select a location');

  return errors;
}

function displayPriceResult(price) {
  const priceDisplay = document.getElementById('uiEstimatedPrice');
  const formatted = formatPrice(price);

  priceDisplay.innerHTML = `
    <div class="result-success">      
      <h3>Estimated Price</h3>
      <p>${formatted}</p>
    </div>
  `;
}

function onClickedEstimatePrice() {
  const errors = validateInputs();
  if (errors.length > 0) {
    showErrorState(errors.join('<br>'));
    return;
  }

  const sqft = parseFloat(document.getElementById('uiSqft').value);
  const bhk = getSelectedValue('uiBHKOptions');
  const bath = getSelectedValue('uiBathOptions');
  const location = document.getElementById('uiLocations').value;

  const resetLoading = showLoadingState();

  setTimeout(() => {
    $.post('/api/proxy?route=predict_home_price', {
      location: location,
      total_sqft: sqft,
      bhk: bhk,
      bath: bath      
    })
      .done(data => {
        resetLoading();
        displayPriceResult(data.estimated_price);
      })
      .fail(() => {
        resetLoading();
        showErrorState("Unable to connect to the server. Please try again.");
      });
  }, 800);
}

function loadLocations() {
  console.log("loading locations")
  $.get('/api/proxy?route=locations')
    .done(data => {
      const locations = data.locations;
      const select = document.getElementById('uiLocations');
      select.innerHTML = '';
      locations.forEach(loc => {
        const opt = document.createElement('option');
        opt.textContent = loc;
        opt.value = loc;
        select.appendChild(opt);
      });
    })
    .fail(() => {
      const select = document.getElementById('uiLocations');
      select.innerHTML = '<option>Error loading locations</option>';
    });
}

function initThemeToggle() {
  const btn = document.getElementById('themeSwitch');
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
  });
}

function initOptionSelectors() {
  const groups = ['uiBHKOptions', 'uiBathOptions'];
  groups.forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON') {
        document.querySelectorAll(`#${id} button`).forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
      }
    });
  });
}

window.onload = () => {
  loadLocations();
  initThemeToggle();
  initOptionSelectors();
  document.getElementById('estimateBtn').addEventListener('click', onClickedEstimatePrice);
};
