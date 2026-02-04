import app from '../config/firebase-config.js';
import { getFirestore, collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

const db = getFirestore(app);

export async function sendMessage(senderId, senderUsername, receiverId, receiverUsername, message) {
    const messageData = {
        senderId,
        senderUsername,
        receiverId,
        receiverUsername,
        message,
        timestamp: new Date().toISOString(),
    };

    await addDoc(collection(db, 'messages'), messageData);
}

export function listenForMessages(userId, inboxContainer, sentContainer, deleteCallback) {
    const messagesCollection = collection(db, 'messages');

    // Listen for incoming messages
    const inboxQuery = query(messagesCollection, where('receiverId', '==', userId));
    onSnapshot(inboxQuery, (snapshot) => {
        inboxContainer.innerHTML = ''; // Clear existing content
        if (snapshot.empty) {
            inboxContainer.innerHTML = '<tr><td colspan="4" class="text-muted">No messages in your inbox.</td></tr>';
        } else {
            snapshot.forEach((doc) => {
                const message = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.senderUsername || 'Unknown User'}</td>
                    <td>${message.message || 'No message content'}</td>
                    <td>${message.timestamp ? new Date(message.timestamp).toLocaleString() : 'Invalid Date'}</td>
                    <td><button class="btn btn-danger btn-sm">Delete</button></td>
                `;
                const deleteButton = row.querySelector('button');
                deleteButton.addEventListener('click', () => deleteCallback(doc.id));
                inboxContainer.appendChild(row);
            });
        }
    });

    // Listen for sent messages
    const sentQuery = query(messagesCollection, where('senderId', '==', userId));
    onSnapshot(sentQuery, (snapshot) => {
        sentContainer.innerHTML = ''; // Clear existing content
        if (snapshot.empty) {
            sentContainer.innerHTML = '<tr><td colspan="4" class="text-muted">No sent messages.</td></tr>';
        } else {
            snapshot.forEach((doc) => {
                const message = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.receiverUsername || 'Unknown User'}</td>
                    <td>${message.message || 'No message content'}</td>
                    <td>${message.timestamp ? new Date(message.timestamp).toLocaleString() : 'Invalid Date'}</td>
                    <td><button class="btn btn-danger btn-sm">Delete</button></td>
                `;
                const deleteButton = row.querySelector('button');
                deleteButton.addEventListener('click', () => deleteCallback(doc.id));
                sentContainer.appendChild(row);
            });
        }
    });
}

export async function deleteMessage(messageId) {
    try {
        await deleteDoc(doc(db, 'messages', messageId));
        alert('Message deleted successfully!');
    } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message.');
    }
}
