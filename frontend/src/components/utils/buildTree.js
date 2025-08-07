// utils/buildTree.js
export const buildFileTree = (files) => {
  const fileMap = {};
  const tree = [];

  // Index files by ID
  files.forEach((file) => {
    file.children = [];
    fileMap[file.id] = file;
  });

  // Link children to parents
  files.forEach((file) => {
    if (file.parentId && fileMap[file.parentId]) {
      fileMap[file.parentId].children.push(file);
    } else {
      tree.push(file); // Root-level files/folders
    }
  });

  return tree;
};
