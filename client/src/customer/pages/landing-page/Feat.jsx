"use client";
import loadBackgroudImages from "../../../common/loadBackgroudImages";
import React, { useEffect } from "react";

function Feat() {
  useEffect(() => {
    loadBackgroudImages();
  }, []);
  return (
    <section className="feat section-padding">
      <div className="container ontop">
        <div className="row">
          <div className="col-lg-5">
            <div className="cont md-mb50">
              <h6 className="sub-title main-color mb-15">Trusted Services</h6>
              <h3 className="mb-30">
                The service we offer is specifically designed to meet your
                needs.
              </h3>
              <p>
                Driven professional dedicated to making a lasting impact through
                innovative solutions and unwavering excellence.
              </p>
              <a
                href="/page-about"
                className="butn-crev d-flex align-items-center mt-40"
              >
                <span className="hover-this">
                  <span className="circle hover-anim">
                    <i className="ti-arrow-top-right"></i>
                  </span>
                </span>
                <span className="text">Learn more</span>
              </a>
            </div>
          </div>
          <div className="col-lg-6 offset-lg-1">
            <div className="item mb-30">
              <div className="row">
                <div
                  className="col-md-4 bg-img"
                  data-background="/assets/imgs/serv-img/1.jpg"
                ></div>
                <div className="col-md-8">
                  <div className="info">
                    <h5 className="mb-15">Web Developments</h5>
                    <p>
                      Build high-performing, responsive, and scalable websites
                      tailored to your brand.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="item mb-30">
              <div className="row">
                <div
                  className="col-md-4 bg-img"
                  data-background="/assets/imgs/serv-img/2.jpg"
                ></div>
                <div className="col-md-8">
                  <div className="info">
                    <h5 className="mb-15">Search Engine Optimization</h5>
                    <p>
                      Improve your website&apos;s visibility and ranking with
                      expert SEO strategies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="item">
              <div className="row">
                <div
                  className="col-md-4 bg-img"
                  data-background="/assets/imgs/serv-img/3.jpg"
                ></div>
                <div className="col-md-8">
                  <div className="info">
                    <h5 className="mb-15">Brand Identity</h5>
                    <p>
                      Craft innovative and user-centric digital experiences that
                      captivate audiences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="circle-blur">
        <img src="/assets/imgs/patterns/blur1.png" alt="" />
      </div>
    </section>
  );
}

export default Feat;
