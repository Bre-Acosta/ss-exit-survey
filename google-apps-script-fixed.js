// Google Apps Script for Starting Strength Memphis Exit Survey
// Deploy this as a web app to receive form data
// Make sure to deploy with "Execute as: Me" and "Who has access: Anyone"

function doPost(e) {
  try {
    // Open the specific spreadsheet by ID
    const spreadsheetId = '1UhX-e50tpkZ0bRpPFVGM8h6vPQgBDo7hQWDPi3UDIIY';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    let sheet = spreadsheet.getActiveSheet();
    
    // Set sheet name if it's not already named
    if (sheet.getName() === 'Sheet1') {
      sheet.setName('Survey Responses');
    }
    
    // Parse the form data
    let data;
    
    if (e.postData.type === 'application/json') {
      // Handle JSON data (for fetch requests)
      data = JSON.parse(e.postData.contents);
    } else {
      // Handle form-encoded data (for form submissions)
      const params = e.parameter || {};
      if (params.data) {
        data = JSON.parse(params.data);
      } else {
        // If no JSON data parameter, construct from individual parameters
        data = params;
      }
    }
    
    // If this is the first submission, create headers
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Overall Experience',
        'Overall Experience Other',
        'Value Perception',
        'Value Perception Comments',
        'Expectations - Coaching',
        'Expectations - Results',
        'Expectations - Program',
        'Expectations - Facility',
        'Expectations - Community',
        'Cancellation Reasons',
        'Cancellation Reason Other',
        'Would Return',
        'Would Refer',
        'Retention Circumstances',
        'Additional Comments'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header row with Starting Strength blue
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#00A3E1');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
    }
    
    // Prepare the row data
    const rowData = [
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
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    
    // Return success response with proper CORS headers
    const output = ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Survey response recorded successfully',
      timestamp: new Date().toISOString()
    }));
    
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
      
  } catch (error) {
    console.error('Error processing survey submission:', error);
    
    // Return error response
    const output = ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Failed to record survey response: ' + error.toString(),
      timestamp: new Date().toISOString()
    }));
    
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

function doGet(e) {
  // Handle GET requests for testing
  const output = ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Starting Strength Memphis Exit Survey API is running',
    timestamp: new Date().toISOString()
  }));
  
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// Test function to verify the script works
function testSubmission() {
  const testData = {
    timestamp: new Date().toISOString(),
    overall_experience: 'good',
    overall_experience_other: '',
    value_perception: 'mostly_yes',
    value_perception_comments: 'Great value for the coaching quality',
    expectations_coaching: 'yes',
    expectations_results: 'somewhat',
    expectations_program: 'yes',
    expectations_facility: 'yes',
    expectations_community: 'yes',
    cancellation_reasons: 'scheduling_conflicts, too_expensive',
    cancellation_reason_other: '',
    would_return: 'maybe',
    would_refer: 'probably',
    retention_circumstances: 'More flexible scheduling options and lower cost',
    additional_comments: 'Great coaching staff, just need better scheduling!'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log('Test result:', result.getContent());
  
  // Also test direct spreadsheet access
  try {
    const spreadsheet = SpreadsheetApp.openById('1UhX-e50tpkZ0bRpPFVGM8h6vPQgBDo7hQWDPi3UDIIY');
    console.log('Spreadsheet access successful:', spreadsheet.getName());
  } catch (error) {
    console.error('Spreadsheet access failed:', error);
  }
}