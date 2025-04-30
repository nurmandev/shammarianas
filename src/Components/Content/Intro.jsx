import React from "react";

function Intro() {
  return (
    <section className="intro section-padding">
      <div className="container">
        <div className="row lg-marg">
          <div className="col-lg-8">
            <div className="row lg-marg">
              <div className="col-md-6">
                <div>
                  <h6 className="sub-title main-color mb-15">Description</h6>
                  <h3 className="mb-30">
                    Words That
                    <span className="fw-300">Build</span>
                    <span className="fw-300">Brands</span>
                  </h3>
                </div>
              </div>
              <div className="col-md-6">
                <div className="text">
                  <p className="mb-15">
                    At Sham Marianas, we turn words into experiences — crafting
                    powerful, engaging content that speaks your brand&apos;s truth
                    and connects with your audience. From attention-grabbing web
                    copy to SEO-friendly blogs, we create content that builds
                    trust, boosts traffic, and drives real results. Whether
                    you're building a new website or refreshing your existing
                    one, our content writing services are designed to bring
                    clarity, creativity, and purpose to every page. We focus on
                    user intent, search engine visibility, and brand consistency
                    — turning passive readers into active customers. With us,
                    your brand won&apos;t just be heard — it will be remembered.
                  </p>

                  <div className="mt-30">
                    <ul className="rest dot-list">
                      <li className="mb-10">
                        Content Writing Services Tailored to You
                      </li>
                      <li className="mb-10">Website Copywriting</li>
                      <li className="mb-10">Blog Writing & Management</li>
                      <li className="mb-10">SEO Content Writing</li>
                      <li className="mb-10">Product Descriptions</li>
                      <li className="mb-10">Social Media Captions & Content</li>
                      <li className="mb-10">Landing Page Content</li>
                      <li className="mb-10">Email Marketing Copy</li>
                      <li className="mb-10">
                        Brand Messaging & Voice Development
                      </li>
                      <li className="mb-10">Content Strategy & Planning</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="numbers mt-80 md-mb50">
              <div className="row lg-marg">
                <div className="col-md-6">
                  <div className="item bord-thin-top pt-30 d-flex align-items-end mt-20 sm-mb30">
                    <div>
                      <h3 className="fw-300 mb-10">100%</h3>
                      <h6 className="p-color sub-title">
                        Clients Satisfaction
                      </h6>
                    </div>
                    <div className="ml-auto">
                      <div className="icon-img-40">
                        <img src="/assets/imgs/arw0.png" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="item bord-thin-top pt-30 d-flex align-items-end mt-20">
                    <div>
                      <h3 className="fw-300 mb-10">6700</h3>
                      <h6 className="p-color sub-title">Projects Completed</h6>
                    </div>
                    <div className="ml-auto">
                      <div className="icon-img-40">
                        <img src="/assets/imgs/arw0.png" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="img-full fit-img">
              <img src="/assets/imgs/intro/2.jpg" alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Intro;
