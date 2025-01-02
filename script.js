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
            <button class="btn btn-secondary btn-sm duplicate-website">Duplicate</button>
            <button class="btn btn-danger btn-sm delete-website">Delete</button>
            </div>
        `;
        header.querySelector('.edit-website').onclick = () => handleEditWebsite(url);
        header.querySelector('.duplicate-website').onclick = () => handleDuplicateWebsite(url);
        header.querySelector('.delete-website').onclick = () => handleDeleteWebsite(url); 

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
            <div class="d-flex justify-content-between">
                <div class="col-sm-4 d-flex justify-content-center align-items-center">
                    <i class="fa-regular fa-user fa-4x"></i>
                </div>
                <div class="col-sm-4">
                    <p class="d-flex"><strong class="d-inline-block me-1">User ID</strong>: ${cred.userId}</p>
                    <p class="d-flex align-items-center"><strong class="d-inline-block me-1">Password</strong> : <span class="password-hidden">*******</span><button id="toggle-password" class="btn btn-outline-primary btn-sm mx-1"><i class="fa fa-eye"></i></button></p>
                    <!--strong class="d-block">Password</strong>: <input type="text" value="12345" class="border-none" readonly/-->
                    
                </div>                  
                <div class="col-sm-4 d-flex justify-content-end align-items-center">
                    <button id="editCred" class="btn btn-outline-warning btn-sm mx-1 edit-user-cred">Edit User</button>    
                    <button id="deleteCred" class="btn btn-outline-danger float-end btn-sm  delete-user-cred">Delete User</button>
                </div>
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

            // here implement the cred delete option  ( onclicl event using variable....)
            const deleteButton = credItem.querySelector('.delete-user-cred');
            deleteButton.onclick = () => handleDeleteCredential(url, index);
    
            // Here the Edit user feature added.  //////////////     Not implemented right now....
            const editUserButton = credItem.querySelector('.edit-user-cred');
            editUserButton.onclick = () => handleEditUser(url, index)
            
            credentialDetails.appendChild(credItem);
        });

        const addCredentialBtn = document.createElement('button');
        addCredentialBtn.className = 'btn btn-sm btn-success mt-2';
        addCredentialBtn.textContent = 'Add Credentials';
        addCredentialBtn.onclick = () => openCredentialModal(url);

        websiteItem.appendChild(header);
        websiteItem.appendChild(credentialDetails);
        websiteItem.appendChild(addCredentialBtn);

        credentialList.appendChild(websiteItem);
    });
}

// Handle duplication of a website with it's all credentials
function handleDuplicateWebsite(url) {
    const websites = JSON.parse(localStorage.getItem('websites')) || {};
    if (websites[url]) {
        const duplicateUrl = `${url}(Duplicated)`; // Create a new key for the duplicate website and sympolyse them as Duplicated
        websites[duplicateUrl] = JSON.parse(JSON.stringify(websites[url])); // Deep copy the credentials
        localStorage.setItem('websites', JSON.stringify(websites)); // Save the updated data to localStorage
        renderWebsites(websites); // Re-render the updated list
    } else {
        alert('Website not found.');
    }
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

    // This section is implemented because if user input something and somehow hit the ....
    //   ....reload button then the box hold the inputted data.
    // Restore website URL input value from sessionStorage on page load
    if (sessionStorage.getItem('websiteUrl')) {
        websiteUrlInput.value = sessionStorage.getItem('websiteUrl');
    }

    // Save website URL input value to sessionStorage while typing
    websiteUrlInput.addEventListener('input', () => {
        sessionStorage.setItem('websiteUrl', websiteUrlInput.value);
    });

    form.onsubmit = event => {
        event.preventDefault();
        const url = websiteUrlInput.value.trim();

        //  Clear previous alert message
        urlValidator.innerHTML = "";

        if (!url) {
            urlValidator.innerHTML = "URL is required";
        }

        //  Validate URL format
        const websites = getFromLocalStorage();            
        if (!urlRegex.test(url)) {
            urlValidator.innerHTML = "Invalid URL format. Please enter a valid URL.";
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

    // Restore user credentials input value from sessionStorage on page load
    if (sessionStorage.getItem('userId')) {
        userIdInput.value = sessionStorage.getItem('userId');
    }
    if (sessionStorage.getItem('password')) {
        passwordInput.value = sessionStorage.getItem('password');
    }

    // Save website URL input value to sessionStorage while typing
    userIdInput.addEventListener('input', () => {
        sessionStorage.setItem('userId', userIdInput.value);
    });
    passwordInput.addEventListener('input', () => {
        sessionStorage.setItem('password', passwordInput.value);
    });

    // Clear previous values and alerts
    userIdInput.value = '';
    passwordInput.value = '';

    form.onsubmit = event => {
        event.preventDefault();
        const userId = userIdInput.value.trim();
        const password = passwordInput.value.trim();

        let isValid = true;
        // Clear previous alerts
        const userIDBox = document.getElementById("userId");
        const passwordBox = document.getElementById('password')
        userIdAlert.textContent = '';
        passwordAlert.textContent = '';

        // Validate userID 
        if (!userId) {
            userIdAlert.innerHTML = "User ID is required";
            userIDBox.style.borderColor = "red";
            userIdAlert.style.display = "block";
            isValid = false;

        if (!password) {
                passwordAlert.textContent = 'Password is required.';
                passwordBox.style.borderColor = "red";
                userIdAlert.style.display = "block";
                isValid = false;
            }
        } else {
            const websites = getFromLocalStorage();
            const  credentials = websites[url] || [];

            // Checking for duplicate userID:
            const isDuplicate = credentials.some(cred => cred.userId === userId);
            if (isDuplicate) {
                userIdAlert.innerHTML = "This User ID exists for the website";
                userIdAlert.style.display = "block";
                isValid = false;
            } else {
                userIdAlert.style.display = "none";
            }
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


//  Implement the delete website url using sweet alert.
function handleDeleteWebsite(url) {
    Swal.fire({
        title: 'Are you sure?',
        text: "This will permanently delete the website!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            const websites = getFromLocalStorage();
            delete websites[url]; // Remove the website
            saveToLocalStorage(websites);
            renderWebsites(websites); // Re-render the updated list

            Swal.fire(
                'Deleted!',
                'The website has been deleted.',
                'success'
            );
        }
    });
}

//  Implement the delete user credentials using sweet alert.
function handleDeleteCredential(url, index) {
    Swal.fire({
        title: 'Are you sure?',
        text: "This will permanently delete the user credential!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            const websites = getFromLocalStorage();
            websites[url].splice(index, 1); // Remove the credential
            saveToLocalStorage(websites);
            renderWebsites(websites); // Re-render the updated list

            Swal.fire(
                'Deleted!',
                'The user credential has been deleted.',
                'success'
            );
        }
    });
}


function handleEditWebsite(url) {
    // Access modal and form elements
    const websiteModal = new bootstrap.Modal(document.getElementById("websiteModal"));
    const websiteUrlInput = document.getElementById("websiteUrlInput");
    const websiteFormUp = document.getElementById("websiteFormUp");
    const websiteUpdateAlert = document.getElementById("websiteUrlUp-alert")
    const websites = getFromLocalStorage(); // Get websites from local storage

    // Pre-fill the current URL in the modal's input field
    websiteUrlInput.value = url;
    websiteUpdateAlert.textContent = "";

    // Show the modal
    websiteModal.show();

    // Form submission event listener
    websiteFormUp.onsubmit = event => {
        event.preventDefault(); // Prevent default form submission

        const newUrl = websiteUrlInput.value.trim();

        let isValid = true;

        // Validate the new URL
        if (!urlRegex.test(newUrl)) {
            websiteUpdateAlert.innerHTML = "Invalid URL format. Please enter a valid URL.";
            websiteUpdateAlert.style.color = "red";
            websiteUrlInput.style.borderColor = "red"; 
            websiteUpdateAlert.style.display = "block";
            isValid = false; 
        } else {
            websiteUpdateAlert.textContent = "";
            websiteUrlInput.style.borderColor = "";
        }

        // Check if the new URL already exists
        if (newUrl == url && websites[newUrl]) {
            websiteUpdateAlert.innerHTML = "This website URL already exists!";
            websiteUpdateAlert.style.color = "red";
            websiteUrlInput.style.borderColor = "red";
            websiteUpdateAlert.style.display = "block";
            isValid = false;
        }

        // Stop execution if validation fails:

        if (!isValid) {
            return;
        }

        // Update the websites object
        websites[newUrl] = websites[url];
        delete websites[url];

        // Save changes to local storage and refresh the list
        saveToLocalStorage(websites);
        loadWebsitesFromLocalStorage();

        // Reset the form and hide the modal
        const websiteModal = bootstrap.Modal.getInstance(document.getElementById('websiteModal'));
        if (isValid) {
            websiteModal.hide();
        }
    };
}



//  Edit user credentials function start from here......
function handleEditUser(url, index) {
    const websites = getFromLocalStorage();
    const credential = websites[url][index];

    // Populate modal fields with current credential values
    document.getElementById('userId').value = credential.userId;
    document.getElementById('password').value = decryptPassword(credential.password);

    // Store URL and index in the modal for reference during submission
    document.getElementById('credentialForm').dataset.url = url;
    document.getElementById('credentialForm').dataset.index = index;

    // Show the modal ( Target modal class from HTML section and open modal while you want to edit)
    const credentialModal = new bootstrap.Modal(document.getElementById('credentialModal'));
    credentialModal.show();
}

// Handle modal form submission
function setupCredentialFormHandler() {
    const credentialForm = document.getElementById('credentialForm');
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const userIdBox = document.getElementById("userId");
    const passwordBox = document.getElementById("password");
    const userIdAlert = document.getElementById('userid-alert');
    const passwordAlert = document.getElementById('password-alert');

    credentialForm.onsubmit = event => {
        event.preventDefault();

        let isValid = true;
        // Clear previous alerts
        userIdAlert.textContent = '';
        passwordAlert.textContent = '';

        const userId = userIdInput.value.trim();
        const password = passwordInput.value.trim();
        const url = credentialForm.dataset.url;
        const index = credentialForm.dataset.index;

        if (!userId) {
            userIdAlert.innerHTML = 'User ID is required.';
            userIdBox.style.borderColor = "red";
            userIdAlert.style.display = "block";
            isValid = false;
        }

        if (!password) {
            passwordAlert.textContent = 'Password is required.';
            passwordBox.style.borderColor = "red";
            userIdAlert.style.display = "block";
            isValid = false;
        }

        // Update credential in local storage
        const websites = getFromLocalStorage();
        const encryptedPassword = encryptPassword(password);
        websites[url][index] = { userId, password: encryptedPassword };

        saveToLocalStorage(websites);
        loadWebsitesFromLocalStorage();

        // Close the modal
        const credentialModal = bootstrap.Modal.getInstance(document.getElementById('credentialModal'));
        if (isValid) {
            credentialModal.hide();
        }    
    };
}

// Initialize the form handler
setupCredentialFormHandler();

// Start the app
init();
