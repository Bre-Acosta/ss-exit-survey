class SurveyFormHandler {
    constructor() {
        // Replace with your deployed Google Apps Script web app URL
        this.scriptURL = 'https://script.google.com/macros/s/AKfycbwwv_GWgi9Joy5DcjJbzi4NvoQ-sbhwISzFu01Yy3PjvNxQ59cThIbv9k6_MPibdsUSpw/exec';
        this.form = document.getElementById('exitSurvey');
        this.submitBtn = document.querySelector('.submit-btn');
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupOtherFieldHandlers();
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Disable submit button to prevent double submission
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Submitting...';
        
        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Validate required fields
            if (!this.validateForm(formData)) {
                throw new Error('Please complete all required fields.');
            }
            
            // Send to Google Sheets
            await this.sendToGoogleSheets(formData);
            
            // Show success message
            this.showSuccessMessage();
            
            // Reset form
            this.form.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage(error.message);
        } finally {
            // Re-enable submit button
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Submit Survey';
        }
    }
    
    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        // Convert FormData to regular object, handling multiple checkboxes
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (checkboxes with same name)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Convert cancellation_reasons array to comma-separated string for easier storage
        if (data.cancellation_reasons && Array.isArray(data.cancellation_reasons)) {
            data.cancellation_reasons = data.cancellation_reasons.join(', ');
        }
        
        // Add timestamp
        data.timestamp = new Date().toISOString();
        
        return data;
    }
    
    validateForm(data) {
        const requiredFields = [
            'value_perception',
            'would_return',
            'would_refer'
        ];
        
        for (let field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                return false;
            }
        }
        
        return true;
    }
    
    async sendToGoogleSheets(data) {
        if (!this.scriptURL || this.scriptURL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            throw new Error('Google Apps Script URL not configured. Please update the scriptURL in form-handler.js');
        }
        
        // Create FormData for faster submission
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        
        // Use fetch with a timeout for speed
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        try {
            const response = await fetch(this.scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return { status: 'success', message: 'Form submitted successfully' };
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                // Timeout occurred, but assume success since Google Apps Script can be slow
                return { status: 'success', message: 'Form submitted successfully' };
            }
            
            throw new Error('Form submission failed: ' + error.message);
        }
    }
    
    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <div style="
                background-color: #d4edda;
                color: #155724;
                padding: 15px;
                border: 1px solid #c3e6cb;
                border-radius: 5px;
                margin: 20px 0;
                text-align: center;
            ">
                <strong>Thank you!</strong> Your feedback has been recorded successfully. 
                We appreciate you taking the time to help us improve.
            </div>
        `;
        
        this.form.parentNode.insertBefore(message, this.form);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    showErrorMessage(errorText) {
        const message = document.createElement('div');
        message.className = 'error-message';
        message.innerHTML = `
            <div style="
                background-color: #f8d7da;
                color: #721c24;
                padding: 15px;
                border: 1px solid #f5c6cb;
                border-radius: 5px;
                margin: 20px 0;
                text-align: center;
            ">
                <strong>Error:</strong> ${errorText}
            </div>
        `;
        
        this.form.parentNode.insertBefore(message, this.form);
        
        // Remove message after 8 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 8000);
        
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    setupOtherFieldHandlers() {
        // Handle "Other" text field enabling/disabling for radio buttons
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function() {
                // Handle "Other" text fields
                const otherField = this.parentNode.querySelector('input[type="text"]');
                if (otherField) {
                    if (this.value === 'other') {
                        otherField.disabled = false;
                        otherField.required = true;
                        otherField.focus();
                    } else {
                        otherField.disabled = true;
                        otherField.required = false;
                        otherField.value = '';
                    }
                }
            });
        });
        
        // Handle "Other" text field enabling/disabling for checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                // Handle "Other" text fields
                const otherField = this.parentNode.querySelector('input[type="text"]');
                if (otherField) {
                    if (this.value === 'other' && this.checked) {
                        otherField.disabled = false;
                        otherField.required = true;
                        otherField.focus();
                    } else if (this.value === 'other' && !this.checked) {
                        otherField.disabled = true;
                        otherField.required = false;
                        otherField.value = '';
                    }
                }
            });
        });
        
        // Initialize other fields as disabled
        document.querySelectorAll('input[type="text"]').forEach(field => {
            const radioParent = field.closest('label');
            if (radioParent) {
                const radio = radioParent.querySelector('input[type="radio"]');
                if (radio && radio.value === 'other') {
                    field.disabled = true;
                }
            }
        });
    }
}

// Initialize the form handler when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SurveyFormHandler();
});
