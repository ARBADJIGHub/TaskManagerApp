CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primary key
    username VARCHAR(50) NOT NULL UNIQUE, -- Unique username
    email VARCHAR(100) NOT NULL UNIQUE, -- Unique email
    password VARCHAR(255) NOT NULL, -- Password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Created at

);

CREATE TABLE tasks ( -- Tasks table
    id IT AUTO_INCREMENT PRIMARY KEY, -- Primary key
    title VARCHAR(100) NOT NULL, -- Title
    description TEXT, -- Description
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending', --Status
    due_date DATETIME, -- Date and time
    user_id INT, -- User id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Created at
    FOREIGN KEY (user_id) PREFERENCES users(id) ON  DELETE CASCADE -- Foreign key
);

CREATE TABLE appointments ( -- Appointments table
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primaty key
    title VARCHAR(100) NOT NULL, -- Title
    description TEXT, -- Description
    start_time DATETIME NOT NULL, -- Start time
    end_time DATETIME NOT NULL, -- End time
    location VARCHAR(255), -- Location
    user_id INT, -- User id
    created_at TIMESTAMP DEFAULT CURRENT_TMESTAMP, -- Created at
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Foreign key
);

CREATE TABLE shared_items ( -- Shared items table
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primary key
    item_type ENUM('task', 'appointment') NOT NULL, -- Item type
    item_id INT NOT NULL, -- Item id
    shared_by INT NOT NULL, -- Shared by
    shared_with INT NOT NULL, -- Shared with
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Created at
    FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE, -- Foreign key
    FOREIGN KEY (shared_with) REFERENCES users(id) ON DELETE CASCADE -- Foreign key

);

CREATE TABLE messages ( -- Messages table
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primary key
    content TEXT NOT NULL, -- Content
    sender_id INT NOT NULL, -- Sender id
    receiver_id INT NOT NULL, -- Receiver id
    is_read BOOLEAN DEFAULT FALSE, -- Is read
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Created at
    FOREIGN KEY (sende_id) REFERENCES users(id) ON DELETE CASCADE, -- Foreign key
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE -- Foreign key

);

CREATE TABLE user_settings ( -- User settings table
    user_id INT PRIMARY KEY, -- User id
    theme ENUM('light', 'dark') DEFAULT 'light', -- Theme
    primary_color VARCHAR(20) DEFAULT '#4285F4', -- Primary color
    secondary-color VARCHAR(20) DEFAULT '#34A853', -- Secondary color
    notification_enabled BOOLEAN DEFAULT TRUE, -- Notfication enabled
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Foreing key

);




