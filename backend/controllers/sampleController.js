const getSample = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: 'Sample data from controller' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  getSample
};
