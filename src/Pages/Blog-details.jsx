"use client";
import React, { useEffect, useLayoutEffect } from "react";

import loadBackgroudImages from "../common/loadBackgroudImages";
function Blogs() {
  useEffect(() => {
    loadBackgroudImages();
  }, []);
  return (
    <>
      <header className="header blog-header section-padding pb-0">
        <div className="container mt-80">
          <div className="row justify-content-center">
            <div className="col-lg-11">
              <div className="caption">
                <div className="sub-title fz-12">
                  <a href="#0">
                    <span>Design , </span>
                  </a>
                  <a href="#0">
                    <span>Development</span>
                  </a>
                </div>
                <h1 className="fz-55 mt-30">
                  Network of wormholes colonies extraordinary claims require.
                </h1>
              </div>
              <div className="info d-flex mt-40 align-items-center">
                <div className="left-info">
                  <div className="d-flex align-items-center">
                    <div className="author-info">
                      <div className="d-flex align-items-center">
                        <a href="#0" className="circle-60">
                          <img
                            src="/assets/imgs/blog/author.png"
                            alt=""
                            className="circle-img"
                          />
                        </a>
                        <a href="#0" className="ml-20">
                          <span className="opacity-7">Author</span>
                          <h6 className="fz-16">UiCamp</h6>
                        </a>
                      </div>
                    </div>
                    <div className="date ml-50">
                      <a href="#0">
                        <span className="opacity-7">Published</span>
                        <h6 className="fz-16">August 6, 2021</h6>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="right-info ml-auto">
                  <div>
                    <span className="pe-7s-comment fz-18 mr-10"></span>
                    <span className="opacity-7">02 Comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="background bg-img mt-80"
          data-background="/assets/imgs/blog/b1.jpg"
        ></div>
      </header>

      <section className="blog section-padding">
        <div className="container">
          <div className="row xlg-marg">
            <div className="col-lg-8">
              <div className="main-post">
                <div className="item pb-60">
                  <article>
                    <div className="text">
                      <p>
                        <span className="spec-letter">Q</span> new report said
                        earlier this week that Apple is working on a brand new
                        laptop. Apple plans to release a 15-inch MacBook Air in
                        2023, a first for the Air series. A trusted Apple
                        insider with a proven track record confirmed that Apple
                        is working on the larger MacBook Air.
                      </p>
                    </div>
                    <div className="text">
                      <p>
                        However, Apple might not include it in the Air series
                        when it launches it. As for the notebook’s release date,
                        the 15-inch MacBook isn’t coming soon. It’ll get a late
                        2023 release at best, according to the new claims.
                      </p>
                    </div>
                    <div className="title mt-30">
                      <h4>What sizes do MacBook Airs come in?</h4>
                    </div>
                    <div className="text mt-20">
                      <p>
                        Apple currently sells only one MacBook Air size. The
                        laptop comes in a 13-inch version that matches the
                        pre-2021 13-inch MacBook Pro size. Previously, Apple
                        sold an 11-inch MacBook Air, but the company
                        discontinued that model in 2017.
                      </p>
                    </div>
                  </article>

                  <div className="post-qoute mt-50">
                    <h6 className="fz-20">
                      <span className="l-block">
                        And the day came when the risk to remain tight in a bud
                        was more painful than the risk it took to blossom.
                      </span>
                      <span className="sub-title mt-20 mb-0"> - UiCamp</span>
                    </h6>
                  </div>

                  <div className="mb-50 mt-50">
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="iner-img sm-mb30">
                          <img src="/assets/imgs/blog/blog1.jpg" alt="" />
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="iner-img">
                          <img src="/assets/imgs/blog/blog2.jpg" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="title mb-10">
                    <h4>Apple currently sells.</h4>
                  </div>

                  <div className="text mb-20">
                    <p>
                      A new report said earlier this week that Apple is working
                      on a brand new laptop. Apple plans to release a 15-inch
                      MacBook Air in 2023, a first for the Air series. A trusted
                      Apple insider with a proven track record confirmed that
                      Apple is working on the larger MacBook Air.
                    </p>
                  </div>

                  <div className="unorder-list mb-30">
                    <h6 className="mb-15">Ordered & Unordered Lists.</h6>
                    <ul className="rest">
                      <li>Yet this above sewed flirted opened ouch</li>
                      <li>Goldfinch realistic sporadic ingenuous</li>
                      <li>
                        Abominable this abidin far successfully then like piquan
                      </li>
                    </ul>
                  </div>

                  <div className="order-list mb-30">
                    <h6 className="mb-15">Ordered & Unordered Lists.</h6>
                    <ul className="rest">
                      <li>
                        <span>01 -</span> Yet this above sewed flirted opened
                        ouch
                      </li>
                      <li>
                        <span>02 -</span> Goldfinch realistic sporadic ingenuous
                      </li>
                      <li>
                        <span>03 -</span> Abominable this abidin far
                        successfully then like piquan
                      </li>
                    </ul>
                  </div>

                  <div className="text">
                    <p>
                      However, Apple might not include it in the Air series when
                      it launches it. As for the notebook’s release date, the
                      15-inch MacBook isn’t coming soon. It’ll get a late 2023
                      release at best, according to the new claims.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Blogs;
