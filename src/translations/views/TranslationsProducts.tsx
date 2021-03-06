import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import useShop from "@saleor/hooks/useShop";
import { commonMessages } from "@saleor/intl";
import { stringify as stringifyQs } from "qs";
import React from "react";
import { useIntl } from "react-intl";

import { maybe } from "../../misc";
import { LanguageCodeEnum } from "../../types/globalTypes";
import TranslationsProductsPage from "../components/TranslationsProductsPage";
import { TypedUpdateProductTranslations } from "../mutations";
import { useProductTranslationDetails } from "../queries";
import { TranslationInputFieldName } from "../types";
import { UpdateProductTranslations } from "../types/UpdateProductTranslations";
import {
  languageEntitiesUrl,
  languageEntityUrl,
  TranslatableEntities
} from "../urls";
import { getParsedTranslationInputData } from "../utils";

export interface TranslationsProductsQueryParams {
  activeField: string;
}
export interface TranslationsProductsProps {
  id: string;
  languageCode: LanguageCodeEnum;
  params: TranslationsProductsQueryParams;
}

const TranslationsProducts: React.FC<TranslationsProductsProps> = ({
  id,
  languageCode,
  params
}) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const shop = useShop();
  const intl = useIntl();

  const productTranslations = useProductTranslationDetails({
    variables: { id, language: languageCode }
  });

  const onEdit = (field: string) =>
    navigate(
      "?" +
        stringifyQs({
          activeField: field
        }),
      true
    );
  const onUpdate = (data: UpdateProductTranslations) => {
    if (data.productTranslate.errors.length === 0) {
      productTranslations.refetch();
      notify({
        status: "success",
        text: intl.formatMessage(commonMessages.savedChanges)
      });
      navigate("?", true);
    }
  };
  const onDiscard = () => {
    navigate("?", true);
  };

  return (
    <TypedUpdateProductTranslations onCompleted={onUpdate}>
      {(updateTranslations, updateTranslationsOpts) => {
        const handleSubmit = (
          fieldName: TranslationInputFieldName,
          data: string
        ) => {
          updateTranslations({
            variables: {
              id,
              input: getParsedTranslationInputData({ data, fieldName }),
              language: languageCode
            }
          });
        };
        const translation = productTranslations?.data?.translation;

        return (
          <TranslationsProductsPage
            activeField={params.activeField}
            disabled={
              productTranslations.loading || updateTranslationsOpts.loading
            }
            languageCode={languageCode}
            languages={maybe(() => shop.languages, [])}
            saveButtonState={updateTranslationsOpts.status}
            onBack={() =>
              navigate(
                languageEntitiesUrl(languageCode, {
                  tab: TranslatableEntities.products
                })
              )
            }
            onEdit={onEdit}
            onDiscard={onDiscard}
            onLanguageChange={lang =>
              navigate(
                languageEntityUrl(lang, TranslatableEntities.products, id)
              )
            }
            onSubmit={handleSubmit}
            data={
              translation?.__typename === "ProductTranslatableContent"
                ? translation
                : null
            }
          />
        );
      }}
    </TypedUpdateProductTranslations>
  );
};
TranslationsProducts.displayName = "TranslationsProducts";
export default TranslationsProducts;
