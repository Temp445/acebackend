function titleToUrl(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') 
    .replace(/\s+/g, '-')        
    .replace(/-+/g, '-');   
}

module.exports = { titleToUrl };
