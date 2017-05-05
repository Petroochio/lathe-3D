import xs from 'xstream';

/**
 * Creates a stream that loads the local storage data once
 *
 * @param key : location of local storage data requested
 * @return stream containing data from key
 */
function loadData(key) {
  return xs.of(localStorage.getItem(key));
}

const lsObserver = {
  next: ({ key, value }) => localStorage.setItem(key, value),
  error: err => console.error(err),
  complete: () => console.log('Local Store Completed'),
};

function makeLocalStorageDriver() {
  return (store$) => {
    store$.subscribe(lsObserver);

    return {
      loadData,
    };
  };
}

export default makeLocalStorageDriver;
