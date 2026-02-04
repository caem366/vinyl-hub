let cart = [];

exports.addToCart = (req, res) => {
  try {
    const { title, artist, price } = req.body;

    // Validate the request body
    if (!title || !artist || typeof price !== 'number') {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    const item = { title, artist, price };
    cart.push(item);
    res.status(201).json({ message: 'Item added to cart', cart });
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCart = (req, res) => {
  try {
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
