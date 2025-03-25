
import useSaveToDownloads from "../../hooks/useSaveToDownloads";
import PropTypes from 'prop-types';

const DownloadButton = ({
  item,
  userProfile,
  setToastMessage,
  setToastState,
  setShowToast,
}) => {
  const { isDownloaded, addToDownloads, error } = useSaveToDownloads( item.id, item, );

  // console.log("DownloadButton:", { item, id:item.id, userProfile  });

  const handleDownload = () => {
    addToDownloads();
    if (item.price - (item.price * item.discount) / 100 === 0) {
      window.open(item.model, '_blank');
      return;
    }

    if (
      userProfile &&
      userProfile.purchasedItems &&
      userProfile.purchasedItems.includes(item.id)
    ) {
      if (item.type === 'models' || item.type === 'printables') {
        window.open(item.model, '_blank');
      } 
      return;
    }

    let cart = localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];

    if (cart.find((cartItem) => cartItem.id === item.id)) {
      setToastMessage('Item already in cart');
      setToastState('warning');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return;
    }

    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    setToastMessage('Item added to cart');
    setToastState('success');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  return (
    <button
      className="add_to_cart_btn"
      onClick={handleDownload}
    >
      {item.price - (item.price * item.discount) / 100 === 0 ? (
        <>
          <i className="icon fas fa-download"></i>
          Download
        </>
      ) : (
        <>
          {isDownloaded ? (
            <>
              <i className="icon fas fa-download"></i>
              Downloaded
            </>
          ) : (
            <>
              <i className="icon fas fa-shopping-cart"></i>
              Add to cart
            </>
          )}
        </>
      )}
    </button>
  );
};
DownloadButton.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    price: PropTypes.number.isRequired,
    discount: PropTypes.number.isRequired,
    model: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  userProfile: PropTypes.shape({
    purchasedItems: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
  }),
  setToastMessage: PropTypes.func.isRequired,
  setToastState: PropTypes.func.isRequired,
  setShowToast: PropTypes.func.isRequired,
};

export default DownloadButton;