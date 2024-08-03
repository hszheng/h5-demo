function multiRequest(urls, maxNum) {
  const results = new Array(urls.length).fill(null);
  let count = 0;
  let index = 0;

  function next() {
    if (index >= urls.length) {
      return Promise.resolve(results);
    }

    const current = index++;
    const url = urls[current];

    return fetch(url).then((response) => {
      results[current] = response;
      count--;
      return next();
    }).catch((error) => {
      results[current] = error;
      count--;
      return next();
    });
  }

  const promises = [];

  while (count < maxNum && index < urls.length) {
    const promise = next();
    promises.push(promise);
    count++;
  }

  return Promise.all(promises).then(() => results);
}

// const urls = [
//   'https://jsonplaceholder.typicode.com/posts/1',
//   'https://jsonplaceholder.typicode.com/posts/2',
//   'https://jsonplaceholder.typicode.com/posts/3',
//   'https://jsonplaceholder.typicode.com/posts/4',
//   'https://jsonplaceholder.typicode.com/posts/5',
//   'https://jsonplaceholder.typicode.com/posts/6',
//   'https://jsonplaceholder.typicode.com/posts/7',
//   'https://jsonplaceholder.typicode.com/posts/8',
//   'https://jsonplaceholder.typicode.com/posts/9',
//   'https://jsonplaceholder.typicode.com/posts/10'
// ];

// multiRequest(urls, 3).then((results) => {
//   results.forEach((result, index) => {
//     if (result instanceof Error) {
//       console.error(`Request for ${urls[index]} failed:`, result);
//     } else {
//       console.log(`Request for ${urls[index]} succeeded with status ${result.status}:`);
//       return result.json().then((data) => {
//         console.log(data);
//       });
//     }
//   });
// }).catch((error) => {
//   console.error('Multi-request failed:', error);
// });