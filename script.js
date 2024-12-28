//  Take a variable to store encrypt password.
const SECRET_KEY = 'my_secret_key';

// Regular expression for validating URLs
const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}\/?$/;

// Initialize the application
function init() {
    loadWebsitesFromLocalStorage();
    setupWebsiteFormHandler();
}

// Save websites and their credentials to local storage
function saveToLocalStorage(data) {
    localStorage.setItem('websites', JSON.stringify(data));
    console.log("Set in local storate....")
}

// Encrypt function for password encryption
function encryptPassword(password) {
    const encPassword = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    console.log(`Encrypted password is  :  ${encPassword}`)
    return encPassword
}

// Decrypt function for decryption of password.
function decryptPassword(encryptPassword) {
    const bytes = CryptoJS.AES.decrypt(encryptPassword, SECRET_KEY)
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8)
    console.log(`The original password is =  ${originalPassword}`)
    return originalPassword;
}

// Get websites and their credentials from local storage
function getFromLocalStorage() {
    return JSON.parse(localStorage.getItem('websites')) || {};
}

// Render all websites and their credentials
function renderWebsites(websites) {
    const credentialList = document.getElementById('credentialList');
    credentialList.innerHTML = '';
// always return array object.
    Object.keys(websites).forEach(url => {
        const websiteItem = document.createElement('li');
        websiteItem.className = 'list-group-item';

        const header = document.createElement('div');
        header.className = 'd-flex justify-content-between align-items-center';
        header.innerHTML = `
            <strong>${url}</strong>
            <div>
            <button class="btn btn-warning btn-sm edit-website">Edit</button>
            <button class="btn btn-danger btn-sm delete-website">Delete</button>
            </div>
        `;

        const credentialDetails = document.createElement('ul');
        credentialDetails.className = 'list-group mt-2';

        websites[url].forEach((cred, index) => {
            const credItem = document.createElement('li');
            credItem.className = 'list-group-item';
            //  Here eye button doesnot work why I have no idea. line number 60.
            // Decrypt password for internal use
            const decryptedPassword = decryptPassword(cred.password)
            console.log(`Decripted Password: ${decryptedPassword}`)

            // Password field with obfuscation and toggle visiblity
            credItem.innerHTML = `
            <div>
            <i class="fa-regular fa-user"></i>
            <strong>User ID</strong>: ${cred.userId},
            <strong>Password</strong>: <span class="password-hidden">*******</span>
            <button id="toggle-password" class="btn btn-outline-primary btn-sm"><i class="fa fa-eye"></i></button>   
            <button id="editCred" class="btn btn-outline-warning btn-sm  edit-user-cred">Edit User</button>    
            <button id="deleteCred" class="btn btn-outline-danger float-end btn-sm  delete-user-cred">Delete User</button>
            </div>`;

            // Add toggle functionality for password visibility
            const passwordSpan = credItem.querySelector('.password-hidden');
            const togglePasswordBtn = credItem.querySelector('#toggle-password');


            togglePasswordBtn.onclick = () => {
                if (passwordSpan.textContent === '*******') {
                    passwordSpan.textContent = decryptedPassword; // Show password
                  //  togglePasswordBtn.textContent = 'Hide';
                } else {
                    passwordSpan.textContent = '*******'; // Hide password
                  //  togglePasswordBtn.textContent = 'Show';
                }
            };

            // here implement the cred delete option
            const deleteButton = credItem.querySelector('.delete-user-cred');
            deleteButton.onclick = () => handleDeleteCredential(url, index);
            
            // Here the Edit user feature added.  //////////////     Not implemented right now....
            // credItem.querySelector(`{#editCred-${index}}`).onclick 
            credentialDetails.appendChild(credItem);
        });

        const addCredentialBtn = document.createElement('button');
        addCredentialBtn.className = 'btn btn-sm btn-success mt-2';
        addCredentialBtn.textContent = 'Add Credentials';
        addCredentialBtn.onclick = () => openCredentialModal(url);

        header.querySelector('.delete-website').onclick = () => handleDeleteWebsite(url);
        header.querySelector('.edit-website').onclick = () => handleEditWebsite(url); ////////////////////////////////////////////////

        websiteItem.appendChild(header);
        websiteItem.appendChild(credentialDetails);
        websiteItem.appendChild(addCredentialBtn);

        credentialList.appendChild(websiteItem);
    });
}

// Load websites from local storage
function loadWebsitesFromLocalStorage() {
    const websites = getFromLocalStorage();
    console.log(websites)
    renderWebsites(websites);
}

// Handle adding a new website
function setupWebsiteFormHandler() {
    const form = document.getElementById('websiteForm');
    const websiteUrlInput = document.getElementById('websiteUrl');
    const urlValidator = document.getElementById('websiteUrl-alert');



    form.onsubmit = event => {
        event.preventDefault();
        const url = websiteUrlInput.value.trim();

        //  Clear previous alert message
        urlValidator.innerHTML = "";

        if (!url) {
            urlValidator.innerHTML = "URL is required";
           // return
        }

        //  Validate URL format
        const websites = getFromLocalStorage();            
        if (!urlRegex.test(url)) {
            urlValidator.innerHTML = "Invalid URL format. Please enter a valid URL.";
            //return
        }

        else if (!websites[url]) {
            websites[url] = []; // Initialize an empty array for credentials
            saveToLocalStorage(websites);
            loadWebsitesFromLocalStorage();
            websiteUrlInput.value = ''; // Clear input
        } else {
            //  Validation for existing website URl under input box
            urlValidator.innerHTML = "This website already exist !"
        }
    
    };
}

// Open modal for adding credentials
function openCredentialModal(url) {
    const credentialModal = new bootstrap.Modal(document.getElementById('credentialModal'));
    const form = document.getElementById('credentialForm');
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const userIdAlert = document.getElementById('userid-alert');
    const passwordAlert = document.getElementById('password-alert')


    form.onsubmit = event => {
        event.preventDefault();
        const userId = userIdInput.value.trim();
        const password = passwordInput.value.trim();

        let isValid = true;

        // Validate userID 
        if (!userId) {
            userIdAlert.innerHTML = "User ID is required";
            userIdAlert.style.display = "block";
            isValid = false;
        } else {
            userIdAlert.style.display = "none"
        }

        // Validate Password
        if (!password) {
            passwordAlert.innerHTML = "Password is required";
            passwordAlert.style.display = "block";
            isValid = false;
        } else {
            passwordAlert.style.display = "none";
        }
        // Save entry if both fields are valid
        if (isValid) {
            const websites = getFromLocalStorage();
            const encryptedPassword = encryptPassword(password);

            websites[url] = websites[url] || []   // Ensure the array is exists or not.
            websites[url].push({ userId, password: encryptedPassword });
            saveToLocalStorage(websites);
            loadWebsitesFromLocalStorage();
            // clear input fields and hide the modal
            userIdAlert.value = '';
            passwordAlert.value = '';
            credentialModal.hide();
        }
    };

    credentialModal.show();
}

// Handle deleting a website
function handleDeleteWebsite(url) {
    const websites = getFromLocalStorage();
    console.log(websites)
    delete websites[url];
    saveToLocalStorage(websites);
    loadWebsitesFromLocalStorage();
}

//   DELETE function each and every crediential
function handleDeleteCredential(url, index) {
    const websites = getFromLocalStorage();
    if (websites[url]) {
        websites[url].splice(index, 1); // Remove the credential at the specified index
        if (websites[url].length === 0) {
            delete websites[url]; // Optionally delete the website if no credentials remain
        }
        saveToLocalStorage(websites);
        loadWebsitesFromLocalStorage(); // Re-render the updated list
    }
}

// Edit ability implement for the websites urls:
function handleEditWebsite(url) {
   // const newUrl = promptI("Edit Website URL:", oldUrl);
    if (newUrl && urlRegex.test(newUrl)) {
        const websites = getFromLocalStorage();
        if (websites[newUrl]) {
            alert("This website URL already exists!");
        } else {
            websites[newUrl] = websites[oldUrl];
            delete websites[oldUrl];
            saveToLocalStorage(websites);
            loadWebsitesFromLocalStorage();
        }
    } else {
        alert("Invalid URL format!")
    }
}
//  Edit user functionality implemented here:
// function handleEditUser(url, index) {
//     const websites = getFromLocalStorage();
//     const credential = websites[url][index];

//     // Open modal for input value of the edit element.
//     const newUserId = prompt('Edit User ID:', credential.userId);
//     const newPassword = prompt('Edit Password:', credential.password)

// }



// Start the app
init();
