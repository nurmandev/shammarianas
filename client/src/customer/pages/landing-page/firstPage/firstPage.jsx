"use client";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Modal, Button, useDisclosure } from "@nextui-org/react";
import QuickSearch from "../header/QuickSearch";
import loadBackgroudImages from "../../../../common/loadBackgroudImages";

function FirstPage() {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Fixed useDisclosure()

  useEffect(() => {
    loadBackgroudImages();
  }, []);

  const searchModal = useMemo(
    () => (
      <Modal
        isOpen={isOpen}
        onClose={onClose} // Fixed incorrect `onOpenChange`
        size="3xl"
        backdrop="blur"
        radius="3xl"
      >
        <QuickSearch />
      </Modal>
    ),
    [isOpen, onClose]
  );

  return (
    <header
      className="main-header bg-img valign"
      data-background="/assets/imgs/background/bg5.jpg"
      data-overlay-dark="7"
    >
      <div className="container ontop">
        <div className="row">
          <div className="col-lg-11">
            <div className="caption">
              <h1>Empowering your</h1>
              <div className="d-flex align-items-end">
                <div>
                  <h1 className="nowrap">
                    <span className="main-color">brand</span> stand out.
                  </h1>
                </div>
                <div>
                  <div className="text ml-30">
                    <p>
                      We back the founders of new forms of network, digital
                      organisations that harness the{" "}
                      <span className="text-light fw-600">
                        talents of individuals
                      </span>{" "}
                      for the benefit of the collective.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-80">
          <div className="col-lg-6 order-md-2">
            <div className="icon-img">
              <img src="/assets/imgs/icon-img/arrow-down-big.png" alt="" />
            </div>
          </div>
          <div className="col-lg-6 d-flex justify-content-end order-md-1">
            <div className="info">
              <h2 className="mb-10">6k +</h2>
              <h6>
                Projects completed <br />
                <span className="main-color">successfully</span>
              </h6>

              <Button
                onClick={onOpen}
                color="default"
                className="search-button"
                startContent={<SearchRoundedIcon />}
              >
                {t("quick search")}
              </Button>
              {searchModal}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default FirstPage;