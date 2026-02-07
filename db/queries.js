const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

// user functions
async function createUser(username, password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                username: username,
                password: hashedPassword
            }
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
}

async function getUserByUsername(username) {
    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });
    return user;
}

async function getUserById(id) {
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    });
    return user;
}

// folder functions
async function createFolder(userId, parentFolderId, folderName) {
    const folder = await prisma.folder.create({
        data: {
            ownerId: userId,
            parentFolderId: parentFolderId,
            name: folderName
        }
    });
    return folder;
}

async function deleteFolder(folderId) {
    return await prisma.folder.delete({
        where: {
            id: folderId
        }
    });
}

async function renameFolder(folderId, newName) {
    const folder = await prisma.folder.update({
        where: {
            id: folderId
        },
        data: {
            name: newName
        }
    });

    return folder;
}

// Root folder id
async function getStorageId(userId) {
    const storage = await prisma.folder.findFirst({
        where: {
            ownerId: userId,
            parentId: null           
        }      
    });
    
    return storage.id;
};
 
async function getFolder(userId, folderId) {
    const folder = await prisma.folder.findFirst({
        where: {
            id: folderId,
            ownerId: userId
        },
        include: {
            parentFolder: true,
            children: { orderBy: { createdAt: 'asc' } },
            files: { orderBy: { createdAt: 'asc' } }
        }       
    });

    return folder;
}

async function createSharedLink(folderId, expiresAt) {
    const sharedLink = await prisma.shareLink.create({
        data: {
            folderId: folderId,
            expires: expiresAt
        }
    });

    return sharedLink;  
}

// file functions
async function createFile(userId, folderId, fileName, size, url) {
    const file = await prisma.file.create({
        data: {
            name: fileName,            
            ownerId: userId,            
            folderId: folderId,
            size: size,
            url: url,
        }
    });

    return file; 
}

async function getFileById(fileId) {
    const file = await prisma.file.findFirst({
        where: {
            id: fileId            
        }
    });

    return file;
}

async function renameFile(fileId, fileName) {
    const file = await prisma.file.update({
        where: {
            id: fileId,
        },
        data: {
            name: fileName,
        },
    });

    return file; 
}

async function deleteFile(fileId) {
    return await prisma.file.delete({
        where: {
            id: fileId,
        }       
    }); 
}

// share link function
async function getSharedLink(id) {
    const link = await prisma.sharedLink.findUnique({
        where: { 
            id,
            expiresAt: { gt: new Date() }
         }      
    });

    return link;
}

module.exports = {
    createUser,
    getUserByUsername,
    getUserById,
    createFolder,
    deleteFolder,
    renameFolder,
    getStorageId,
    getFolder,
    createSharedLink,
    createFile,
    getFileById,
    renameFile,
    deleteFile,
    getSharedLink,
}