// Simple form handler that submits to Google Forms (no CORS issues)
// This approach bypasses Google Apps Script CORS limitations

class SurveyFormHandler {
    constructor() {
        // Google Form URL - replace with your actual Google Form URL
        // Format: https://docs.google.com/forms/d/e/[FORM_ID]/formResponse
        this.googleFormURL = 'YOUR_GOOGLE_FORM_URL_HERE';
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
            
            // Send to Google Forms
            await this.sendToGoogleForm(formData);
            
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
        
        // Convert cancellation_reasons array to comma-separated string
        if (data.cancellation_reasons && Array.isArray(data.cancellation_reasons)) {
            data.cancellation_reasons = data.cancellation_reasons.join(', ');
        }
        
        // Add timestamp
        data.timestamp = new Date().toISOString();
        
        return data;
    }
    
    validateForm(data) {
        const requiredFields = [
            'overall_experience',
            'value_perception',
            'cancellation_reasons',
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
    
    async sendToGoogleForm(data) {
        if (!this.googleFormURL || this.googleFormURL === 'YOUR_GOOGLE_FORM_URL_HERE') {
            // Fallback: show success message AND provide data for manual entry
            console.log('Survey response data:', data);
            
            // Show data in a copyable format after success message
            setTimeout(() => {
                this.showDataForCopy(data);
            }, 2000);
            
            return; // This will trigger the success message in handleSubmit
        }
        
        // Create form data for Google Forms
        const googleFormData = new FormData();
        
        // Map your form fields to Google Form field IDs
        // You'll need to replace these with actual Google Form field IDs
        googleFormData.append('entry.TIMESTAMP_ID', data.timestamp);
        googleFormData.append('entry.OVERALL_EXPERIENCE_ID', data.overall_experience);
        googleFormData.append('entry.VALUE_PERCEPTION_ID', data.value_perception);
        googleFormData.append('entry.CANCELLATION_REASONS_ID', data.cancellation_reasons);
        googleFormData.append('entry.WOULD_RETURN_ID', data.would_return);
        googleFormData.append('entry.WOULD_REFER_ID', data.would_refer);
        googleFormData.append('entry.RETENTION_CIRCUMSTANCES_ID', data.retention_circumstances);
        
        // Submit to Google Form using iframe (avoids CORS)
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.name = 'google-form-submit';
        document.body.appendChild(iframe);
        
        const tempForm = document.createElement('form');
        tempForm.target = 'google-form-submit';
        tempForm.method = 'POST';
        tempForm.action = this.googleFormURL;
        
        // Add all form data as hidden inputs
        for (let [key, value] of googleFormData.entries()) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            tempForm.appendChild(input);
        }
        
        document.body.appendChild(tempForm);
        tempForm.submit();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(tempForm);
            document.body.removeChild(iframe);
        }, 1000);
    }
    
    showDataForCopy(data) {
        // Format data in spreadsheet-ready format
        const spreadsheetData = [
            data.timestamp || new Date().toISOString(),
            data.overall_experience || '',
            data.overall_experience_other || '',
            data.value_perception || '',
            data.value_perception_comments || '',
            data.expectations_coaching || '',
            data.expectations_results || '',
            data.expectations_program || '',
            data.expectations_facility || '',
            data.expectations_community || '',
            data.cancellation_reasons || '',
            data.cancellation_reason_other || '',
            data.would_return || '',
            data.would_refer || '',
            data.retention_circumstances || '',
            data.additional_comments || ''
        ].join('\t'); // Tab-separated for easy Excel/Sheets pasting

        const dataDisplay = document.createElement('div');
        dataDisplay.className = 'data-copy-display';
        dataDisplay.innerHTML = `
            <div style="
                background-color: #e8f4f8;
                border: 2px solid #00A3E1;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
            ">
                <h3 style="color: #00A3E1; margin-bottom: 15px;">📋 Copy Data to Spreadsheet</h3>
                <p style="margin-bottom: 15px; color: #333;">
                    Click the button below to copy this response data, then paste it into your Google Sheet.
                </p>
                <button onclick="
                    navigator.clipboard.writeText(this.nextElementSibling.textContent);
                    this.textContent = 'Copied! ✓';
                    this.style.backgroundColor = '#28a745';
                    setTimeout(() => {
                        this.textContent = 'Copy Data';
                        this.style.backgroundColor = '#00A3E1';
                    }, 2000);
                " style="
                    background-color: #00A3E1;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 15px;
                ">Copy Data</button>
                <div style="display: none;">${spreadsheetData}</div>
                <details style="margin-top: 15px;">
                    <summary style="cursor: pointer; color: #666;">View Raw Data</summary>
                    <div style="
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 5px;
                        margin-top: 10px;
                        font-family: monospace;
                        font-size: 12px;
                        text-align: left;
                        white-space: pre-wrap;
                        max-height: 200px;
                        overflow-y: auto;
                    ">${JSON.stringify(data, null, 2)}</div>
                </details>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-top: 15px;
                ">Close</button>
            </div>
        `;
        
        this.form.parentNode.insertBefore(dataDisplay, this.form.nextSibling);
        
        // Auto-remove after 5 minutes
        setTimeout(() => {
            if (dataDisplay.parentNode) {
                dataDisplay.parentNode.removeChild(dataDisplay);
            }
        }, 300000);
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
                const checkbox = radioParent.querySelector('input[type="checkbox"]');
                if ((radio && radio.value === 'other') || (checkbox && checkbox.value === 'other')) {
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