import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Modal, Button, useDisclosure } from "@nextui-org/react";
import QuickSearch from "./QuickSearch";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

function SearchPage() {
  const { t } = useTranslation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const searchModal = useMemo(
    () => (
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        backdrop="blur"
        radius="3xl"
      >
        <QuickSearch />
      </Modal>
    ),
    [isOpen, onOpenChange]
  );

  return (
    <div
      className="relative after:absolute after:w-full after:h-full 
      after:bg-gradient-to-tr after:from-white dark:after:from-black"
    >
      <div
        className="h-full lg:h-[20vh] w-full relative after:absolute after:w-full after:h-full 
        after:bg-gradient-to-t after:from-white dark:after:from-black after:to-transparent after:left-0 after:top-0 
        flex justify-center items-center"
      >
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
  );
}

export default SearchPage;
