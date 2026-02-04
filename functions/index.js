import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const db = admin.firestore();

exports.processListingDescriptions = functions.firestore
    .document('listings/{listingId}')
    .onWrite(async (change, context) => {
        const listingId = context.params.listingId;
        const afterData = change.after.exists ? change.after.data() : null;

        if (afterData && afterData.description) {
            const plainTextDescription = stripHtml(afterData.description); // Convert to plain text
            await db.collection('listings').doc(listingId).update({ description: plainTextDescription });
            console.log(`Processed description for listing ${listingId}`);
        }
    });

function stripHtml(html) {
    return html.replace(/<\/?[^>]+(>|$)/g, ''); // Remove HTML tags
}
