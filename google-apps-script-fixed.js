function doPost(e) {
  try {
    // Open the specific spreadsheet by ID
    var spreadsheetId = '1UhX-e50tpkZ0bRpPFVGM8h6vPQgBDo7hQWDPi3UDIIY';
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getActiveSheet();
    
    // Set sheet name if it's not already named
    if (sheet.getName() === 'Sheet1') {
      sheet.setName('Survey Responses');
    }
    
    // Parse the form data
    var data;
    
    if (e.postData && e.postData.type === 'application/json') {
      // Handle JSON data (for fetch requests)
      data = JSON.parse(e.postData.contents);
    } else {
      // Handle form-encoded data (for form submissions)
      var params = e.parameter || {};
      if (params.data) {
        data = JSON.parse(params.data);
      } else {
        // If no JSON data parameter, construct from individual parameters
        data = params;
      }
    }
    
    // If this is the first submission, create headers
    if (sheet.getLastRow() === 0) {
      var headers = [
        'Timestamp',
        'Value Perception',
        'Value Perception Comments',
        'Cancellation Reasons',
        'Cancellation Reason Other',
        'Would Return',
        'Would Refer',
        'Retention Circumstances',
        'Additional Comments'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header row with Starting Strength blue
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#00A3E1');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
    }
    
    // Prepare the row data
    var rowData = [
      data.timestamp || new Date().toISOString(),
      data.value_perception || '',
      data.value_perception_comments || '',
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
    var output = ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Survey response recorded successfully',
      timestamp: new Date().toISOString()
    }));
    
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
      
  } catch (error) {
    console.error('Error processing survey submission:', error);
    
    // Return error response
    var output = ContentService.createTextOutput(JSON.stringify({
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
  var output = ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Starting Strength Memphis Exit Survey API is running',
    timestamp: new Date().toISOString()
  }));
  
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// Test function to verify the script works
function testSubmission() {
  var testData = {
    timestamp: new Date().toISOString(),
    value_perception: 'mostly_yes',
    value_perception_comments: 'Great value for the coaching quality',
    cancellation_reasons: 'scheduling_conflicts, too_expensive',
    cancellation_reason_other: '',
    would_return: 'maybe',
    would_refer: 'probably',
    retention_circumstances: 'More flexible scheduling options and lower cost',
    additional_comments: 'Great coaching staff, just need better scheduling!'
  };
  
  var mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  var result = doPost(mockEvent);
  console.log('Test result:', result.getContent());
  
  // Also test direct spreadsheet access
  try {
    var spreadsheet = SpreadsheetApp.openById('1UhX-e50tpkZ0bRpPFVGM8h6vPQgBDo7hQWDPi3UDIIY');
    console.log('Spreadsheet access successful:', spreadsheet.getName());
  } catch (error) {
    console.error('Spreadsheet access failed:', error);
  }
}
