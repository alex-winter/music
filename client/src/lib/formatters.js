function formatFileMetadata(file) {
  const modifiedDate = new Date(file.modifiedAt).toLocaleString();
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  return `${file.ext.replace('.', '').toUpperCase()} - ${sizeMb} MB - ${modifiedDate}`;
}

export {
  formatFileMetadata
};
