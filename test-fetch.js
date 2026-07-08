async function run() {
  const formData = new FormData();
  formData.append('name', 'Test Product');
  formData.append('price', '100');
  formData.append('category', 'gift-shop');
  formData.append('stockQuantity', '10');

  try {
    const res = await fetch('http://localhost:5000/api/products/60d5ecb8b392d72f8430e4a2', {
      method: 'POST',
      body: formData
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', text);
  } catch (e) {
    console.error(e);
  }
}
run();
