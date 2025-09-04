export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};



export const truncateText = (str, length = 100) => {
  return str.length > length ? str.slice(0, length) + '...' : str;
};

export const capitalize = str =>
  str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase();

export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map(word => word[0]?.toUpperCase())
    .join('');
};


export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
