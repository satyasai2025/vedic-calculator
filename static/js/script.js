// Vedic Astrology App JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize location helpers
    initializeLocationHelpers();
    
    // Initialize chart interactions
    initializeChartInteractions();
});

function initializeFormValidation() {
    const form = document.getElementById('birthForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        const isValid = validateForm();
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        form.classList.add('was-validated');
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
}

function validateForm() {
    const form = document.getElementById('birthForm');
    let isValid = true;
    
    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Validate coordinates
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        showFieldError('latitude', 'Latitude must be between -90 and 90 degrees');
        isValid = false;
    }
    
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        showFieldError('longitude', 'Longitude must be between -180 and 180 degrees');
        isValid = false;
    }
    
    // Validate birth date (not in future)
    const birthDate = new Date(document.getElementById('birth_date').value);
    const today = new Date();
    
    if (birthDate > today) {
        showFieldError('birth_date', 'Birth date cannot be in the future');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    
    // Check required fields
    if (field.hasAttribute('required') && !value) {
        showFieldError(field.id, 'This field is required');
        isValid = false;
    } else {
        clearFieldError(field.id);
    }
    
    // Specific validations
    if (field.type === 'number' && value) {
        const num = parseFloat(value);
        if (isNaN(num)) {
            showFieldError(field.id, 'Please enter a valid number');
            isValid = false;
        }
    }
    
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field.id, 'Please enter a valid email address');
            isValid = false;
        }
    }
    
    return isValid;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}_error`);
    
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.id = `${fieldId}_error`;
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}_error`);
    
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function initializeLocationHelpers() {
    // Location search functionality
    const searchBtn = document.getElementById('searchLocationBtn');
    const locationInput = document.getElementById('location_name');
    const manualBtn = document.getElementById('manualEntryBtn');
    
    if (searchBtn && locationInput) {
        searchBtn.addEventListener('click', searchLocation);
        locationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchLocation();
            }
        });
    }
    
    // Manual entry toggle
    if (manualBtn) {
        manualBtn.addEventListener('click', toggleManualEntry);
    }
    
    // Add geolocation button if supported
    if ('geolocation' in navigator) {
        const latField = document.getElementById('latitude');
        const lngField = document.getElementById('longitude');
        
        if (latField && lngField) {
            const geoButton = document.createElement('button');
            geoButton.type = 'button';
            geoButton.className = 'btn btn-outline-secondary btn-sm mt-2';
            geoButton.innerHTML = '<i class="bi bi-geo-alt"></i> Use Current Location';
            geoButton.onclick = getCurrentLocation;
            
            lngField.parentNode.appendChild(geoButton);
        }
    }
}

function getCurrentLocation() {
    const geoButton = event.target;
    geoButton.innerHTML = '<i class="bi bi-arrow-repeat"></i> Getting Location...';
    geoButton.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            document.getElementById('latitude').value = position.coords.latitude.toFixed(6);
            document.getElementById('longitude').value = position.coords.longitude.toFixed(6);
            
            geoButton.innerHTML = '<i class="bi bi-check"></i> Location Set';
            geoButton.className = 'btn btn-success btn-sm mt-2';
            
            setTimeout(() => {
                geoButton.innerHTML = '<i class="bi bi-geo-alt"></i> Use Current Location';
                geoButton.className = 'btn btn-outline-secondary btn-sm mt-2';
                geoButton.disabled = false;
            }, 2000);
        },
        function(error) {
            console.error('Geolocation error:', error);
            geoButton.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Location Failed';
            geoButton.className = 'btn btn-danger btn-sm mt-2';
            
            setTimeout(() => {
                geoButton.innerHTML = '<i class="bi bi-geo-alt"></i> Use Current Location';
                geoButton.className = 'btn btn-outline-secondary btn-sm mt-2';
                geoButton.disabled = false;
            }, 2000);
        }
    );
}

function initializeChartInteractions() {
    // Add hover effects to planet rows
    const planetRows = document.querySelectorAll('tbody tr');
    planetRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.1)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });
    
    // Add click to copy coordinates
    const coordinateElements = document.querySelectorAll('.degree-display');
    coordinateElements.forEach(element => {
        element.style.cursor = 'pointer';
        element.title = 'Click to copy';
        
        element.addEventListener('click', function() {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(function() {
                showToast('Coordinates copied to clipboard!');
            }).catch(function() {
                console.log('Failed to copy coordinates');
            });
        });
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function showToast(message, type = 'info') {
    // Create toast element
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

// Format degrees for display
function formatDegree(degree) {
    const deg = Math.floor(degree);
    const min = Math.floor((degree - deg) * 60);
    const sec = Math.floor(((degree - deg) * 60 - min) * 60);
    return `${deg}°${min}'${sec}"`;
}

// Planet symbols mapping
const planetSymbols = {
    'Sun': '☉',
    'Moon': '☽',
    'Mars': '♂',
    'Mercury': '☿',
    'Jupiter': '♃',
    'Venus': '♀',
    'Saturn': '♄',
    'Rahu': '☊',
    'Ketu': '☋'
};

// Sign symbols mapping
const signSymbols = {
    'Aries': '♈',
    'Taurus': '♉',
    'Gemini': '♊',
    'Cancer': '♋',
    'Leo': '♌',
    'Virgo': '♍',
    'Libra': '♎',
    'Scorpio': '♏',
    'Sagittarius': '♐',
    'Capricorn': '♑',
    'Aquarius': '♒',
    'Pisces': '♓'
};

// Add symbols to planet and sign names
function addAstrologySymbols() {
    // Add planet symbols
    Object.keys(planetSymbols).forEach(planet => {
        const elements = document.querySelectorAll('td');
        elements.forEach(el => {
            if (el.textContent.trim() === planet) {
                el.innerHTML = `<span class="planet-symbol">${planetSymbols[planet]}</span>${planet}`;
            }
        });
    });
    
    // Add sign symbols
    Object.keys(signSymbols).forEach(sign => {
        const elements = document.querySelectorAll('td');
        elements.forEach(el => {
            if (el.textContent.trim() === sign) {
                el.innerHTML = `${sign} <span class="sign-symbol">${signSymbols[sign]}</span>`;
            }
        });
    });
}

// Initialize symbols when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addAstrologySymbols, 100);
});

// Print functionality
function printChart() {
    window.print();
}

// Export functionality (placeholder)
function exportChart() {
    showToast('Export functionality coming soon!', 'info');
}

// Location search functionality
function searchLocation() {
    const locationInput = document.getElementById('location_name');
    const searchBtn = document.getElementById('searchLocationBtn');
    const latField = document.getElementById('latitude');
    const lngField = document.getElementById('longitude');
    const timezoneField = document.getElementById('timezone');
    
    const locationName = locationInput.value.trim();
    if (!locationName) {
        showToast('Please enter a location name', 'warning');
        return;
    }
    
    // Show loading state
    searchBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Searching...';
    searchBtn.disabled = true;
    
    // Make API call to geocode
    fetch(`/api/geocode?location=${encodeURIComponent(locationName)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'danger');
                return;
            }
            
            // Fill in the form fields
            latField.value = data.latitude.toFixed(6);
            lngField.value = data.longitude.toFixed(6);
            timezoneField.value = data.timezone;
            
            // Show success message
            showToast(`Location found: ${data.display_name}`, 'success');
            
            // Update location input with full name
            locationInput.value = data.display_name;
            
            // Clear any validation errors
            clearFieldError('latitude');
            clearFieldError('longitude');
            clearFieldError('timezone');
            
        })
        .catch(error => {
            console.error('Geocoding error:', error);
            showToast('Failed to search location. Please try again.', 'danger');
        })
        .finally(() => {
            // Reset button state
            searchBtn.innerHTML = '<i class="bi bi-search"></i> Search';
            searchBtn.disabled = false;
        });
}

// Toggle manual entry for coordinates
function toggleManualEntry() {
    const latField = document.getElementById('latitude');
    const lngField = document.getElementById('longitude');
    const manualBtn = document.getElementById('manualEntryBtn');
    
    if (latField.readOnly) {
        // Enable manual entry
        latField.readOnly = false;
        lngField.readOnly = false;
        latField.placeholder = 'Enter latitude manually';
        lngField.placeholder = 'Enter longitude manually';
        manualBtn.innerHTML = '<i class="bi bi-arrow-left"></i> Use Search';
        manualBtn.classList.remove('btn-outline-primary');
        manualBtn.classList.add('btn-outline-warning');
        
        // Clear current values
        latField.value = '';
        lngField.value = '';
        
        showToast('Manual entry enabled. Enter coordinates manually.', 'info');
    } else {
        // Disable manual entry
        latField.readOnly = true;
        lngField.readOnly = true;
        latField.placeholder = 'Auto-filled from location search';
        lngField.placeholder = 'Auto-filled from location search';
        manualBtn.innerHTML = '<i class="bi bi-pencil"></i> Manual Entry';
        manualBtn.classList.remove('btn-outline-warning');
        manualBtn.classList.add('btn-outline-primary');
        
        showToast('Search mode enabled. Use location search above.', 'info');
    }
}
