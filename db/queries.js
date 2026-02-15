const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

// user functions
async function createUser(username, password, prismaClient = prisma) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = prismaClient.user.create({
        data: {
            username: username,
            password: hashedPassword
        }
    });
    return user;
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
            id: Number(id)
        }
    });
    return user;
}

// folder functions
async function createFolder(userId, parentFolderId = null, folderName) {
    const folder = await prisma.folder.create({
        data: {
            ownerId: userId,
            parentId: Number(parentFolderId),
            name: folderName
        }
    });
    return folder;
}

async function deleteFolder(folderId, userId) {
    const folder = await prisma.folder.findFirst({
        where: {
            id: Number(folderId),
            ownerId: userId
        }
    });

    if (!folder) {
        throw new Error('Folder not found');
    }

    // root folder protection
    if (folder.parentId === null) {
        throw new Error('Root folder cannot be deleted');
    }

    const deletion = await prisma.folder.delete({
        where: {
            id: Number(folderId),
            ownerId: userId
        }
    });
    return deletion;
}

async function renameFolder(folderId, userId, newName) {
    const folder = await prisma.folder.update({
        where: {
            id: Number(folderId),
            ownerId: userId
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
            id: Number(folderId),
            ownerId: userId
        },
        include: {
            parentFolder: true,
            children: { orderBy: { created: 'asc' } },
            files: { orderBy: { created: 'asc' } }
        }       
    });

    return folder;
}

async function getAllFolders(userId) {
    const folders = await prisma.folder.findMany({
        where: {
            ownerId: userId,
            parentId: null
        },
        orderBy: {
            created: 'asc'
        } 
    });
    return folders;
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
async function createFile(userId, folderId, fileName, size, url, publicId) {
    const file = await prisma.file.create({
        data: {
            name: fileName,            
            ownerId: userId,            
            folderId: folderId,
            size: size,
            url: url,
            publicId: publicId
        }
    });

    return file; 
}

async function getFileById(fileId, userId) {
    const file = await prisma.file.findFirst({
        where: {
            id: Number(fileId),
            ownerId: userId
        }
    });

    return file;
}

async function renameFile(fileId, userId, newName, url, publicId) {
    const file = await prisma.file.update({
        where: {
            id: Number(fileId),
            ownerId: userId
        },
        data: {
            name: newName,
            url: url,
            publicId: publicId
        },
    });

    if (file.count === 0) {
        throw new Error('File not found!');
    }

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
    const link = await prisma.shareLink.findUnique({
        where: { 
            id,
            expires: new Date() 
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
    getAllFolders,
    createSharedLink,
    createFile,
    getFileById,
    renameFile,
    deleteFile,
    getSharedLink,
}