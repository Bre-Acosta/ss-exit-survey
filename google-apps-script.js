// Google Apps Script for Exit Survey Form Submission
// Deploy this as a web app to receive form data

function doPost(e) {
  try {
    // Get the active spreadsheet or create a new one
    let sheet;
    try {
      sheet = SpreadsheetApp.getActiveSheet();
    } catch (error) {
      // If no active spreadsheet, create a new one
      const spreadsheet = SpreadsheetApp.create('Starting Strength Exit Survey Responses');
      sheet = spreadsheet.getActiveSheet();
      sheet.setName('Survey Responses');
    }
    
    // Parse the form data
    const data = JSON.parse(e.postData.contents);
    
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
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#00A3E1'); // Starting Strength Blue
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
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Survey response recorded successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing survey submission:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Failed to record survey response: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests and CORS preflight
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Starting Strength Exit Survey API is running'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Optional: Create a test function to verify the script works
function testSubmission() {
  const testData = {
    timestamp: new Date().toISOString(),
    overall_experience: 'good',
    overall_experience_other: '',
    value_perception: 'mostly_yes',
    value_perception_comments: 'Test comment',
    expectations_coaching: 'yes',
    expectations_results: 'somewhat',
    expectations_program: 'yes',
    expectations_facility: 'yes',
    expectations_community: 'yes',
    cancellation_reasons: 'scheduling_conflicts, lack_progress',
    cancellation_reason_other: '',
    would_return: 'maybe',
    would_refer: 'probably',
    retention_circumstances: 'More flexible scheduling options',
    additional_comments: 'Great coaching staff!'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log('Test result:', result.getContent());
}