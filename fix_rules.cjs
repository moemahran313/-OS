const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

const toAdd = `
    // Added new accounting collections
    match /accounting_customers/{docId} {
      allow read, write: if isSignedIn() && (resource == null || resource.data.userId == request.auth.uid) && (request.resource == null || request.resource.data.userId == request.auth.uid);
    }
    match /accounting_invoices/{docId} {
      allow read, write: if isSignedIn() && (resource == null || resource.data.userId == request.auth.uid) && (request.resource == null || request.resource.data.userId == request.auth.uid);
    }
    match /accounting_suppliers/{docId} {
      allow read, write: if isSignedIn() && (resource == null || resource.data.userId == request.auth.uid) && (request.resource == null || request.resource.data.userId == request.auth.uid);
    }
    match /accounting_bills/{docId} {
      allow read, write: if isSignedIn() && (resource == null || resource.data.userId == request.auth.uid) && (request.resource == null || request.resource.data.userId == request.auth.uid);
    }
    match /accounting_budgets/{docId} {
      allow read, write: if isSignedIn() && (resource == null || resource.data.userId == request.auth.uid) && (request.resource == null || request.resource.data.userId == request.auth.uid);
    }
    match /accounting_fixed_assets/{docId} {
      allow read, write: if isSignedIn() && (resource == null || resource.data.userId == request.auth.uid) && (request.resource == null || request.resource.data.userId == request.auth.uid);
    }
`;

// Remove appended content from the end
content = content.replace(/\/\/ Added new accounting collections[\s\S]*/, '');

// Insert it right before the last closing brackets
const insertIndex = content.lastIndexOf('  }\n}');
if (insertIndex !== -1) {
  content = content.slice(0, insertIndex) + toAdd + content.slice(insertIndex);
}

fs.writeFileSync('firestore.rules', content);
