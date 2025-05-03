import React from "react";

const footerLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "#about" },
  { name: "Templates", href: "#templates" },
  { name: "Services", href: "#services" },
  { name: "Portfolio", href: "#portfolio" },
  { name: "Blog", href: "#blog" },
  { name: "Contact us", href: "#contact" },
];

function Footer() {
  return (
    <footer className="clean-footer crev">
      <div className="container pb-40 pt-40 ontop">
        <div className="row justify-content-between">
          <div className="col-lg-2">
            <div className="logo icon-img-100 md-mb80">
              <img src="/assets/imgs/logo.png" alt="" />
            </div>
          </div>
          <div className="col-lg-4">
            <div className="column md-mb50">
              <h6 className="sub-title mb-30">Contact</h6>
              <h6 className="mt-30 mb-15">
                <a href="mailto:info@shammarianas.com">info@shammarianas.com</a>
              <br />
              <br />
                <a href="mailto:info@shammarianas.com">+971 52 803 6012</a>
              </h6>
            </div>
          </div>
          <div className="col-lg-2">
            <div className="column md-mb50">
              <h6 className="sub-title mb-30">Useful Links</h6>
              <ul className="rest fz-14 opacity-7">
                {footerLinks.map((link, index) => (
                  <li className="mb-15" key={index}>
                    <a href={link.href}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="column subscribe-minimal">
              <h6 className="sub-title mb-30">Newsletter</h6>
              <div className="form-group mb-40">
                <input type="text" name="subscrib" placeholder="Your Email" />
                <button>
                  <span className="ti-location-arrow"></span>
                </button>
              </div>
              <ul className="rest social-icon d-flex align-items-center">
                <li className="hover-this cursor-pointer">
                  <a href="https://www.youtube.com/c/ShamMarianasSM" target="_blank">
                    <i className="fa-brands fa-youtube"></i>
                  </a>
                </li>
                <li className="hover-this cursor-pointer">
                  <a href="https://www.facebook.com/shammarianas" target="_blank">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                </li>
                <li className="hover-this cursor-pointer ml-10">
                  <a href="https://shammarianas.com" target="_blank">
                    <i className="fab fa-dribbble"></i>
                  </a>
                </li>
                <li className="hover-this cursor-pointer ml-10">
                  <a href="https://www.pinterest.com/shammarianas">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </li>
                <li className="hover-this cursor-pointer ml-10">
                  <a href="https://www.instagram.com/sham_marianas" className="hover-anim">
                    <i className="fab fa-instagram"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-30 pb-30 mt-80 bord-thin-top">
          <div className="text-center">
            <p className="fz-14">
              © 2025 All Rights Reserved By{" "}
              <span className="underline main-color">
                <a href="/" target="_blank">
                  Sham Marianas
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="circle-blur">
        <img src="/assets/imgs/patterns/blur1.png" alt="" />
      </div>
    </footer>
  );
}

export default Footer;
