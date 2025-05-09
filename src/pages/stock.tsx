import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { MainHeader } from "./mainHeader";
import { CirclePlus, Edit, XCircleIcon } from "lucide-react";
import { ButtonComponent } from "../utilities/buttons";
import ModalFormMain from "../utilities/modalFormMain";
import { useTheme } from "../utilities/theme";
import {
  handleDelete,
  handleGet,
  handlePost,
  handlePut,
} from "../utilities/handleApiCalls";
import { useNavigate } from "react-router-dom";

export const Stock = () => {
  const [selectedCategory, setSelectedCategory] = useState<Record<string, any> | null>(null);
  
  const [modalType, setModalType] = useState<
    "" | "addCategory" | "editCategory" | "deleteCategory" | "deleteProduct" | "editProduct" | "addProduct"
  >("");
  type Category = {
    code: string;
    description: string;
    isActive: boolean;
  };

  type Products = {
    code: string;
    title: string;
    category: string;
    categoryTitle: string;
    price: number;
    isActive: boolean;
    imageFormat: string;
  };

  const [category, setCategory] = useState<Category[]>([]);
  const [products, setProducts] = useState<Products[]>([]);
  const [selectedItem, setSelectedItem] = useState<Record<string, any>>({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await handleGet("api/ProductCategory/GetAll");
        if (response.isSuccessfull) {
          setCategory(response.data);
        }
        if (response.error) {
          localStorage.setItem("access_token", "");
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };
    fetchRooms();
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (selectedCategory) {
        try {
          const response = await handleGet("api/Product/GetAll");
          if (response.isSuccessfull) {
            setProducts(response.data);
          } else if (response.error) {
            localStorage.setItem("access_token", "");
            navigate("/");
          }
        } catch (err) {
          console.error("Error fetching products:", err);
        }
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const [categoryItem, setCategoryItem] = useState({
    code: "",
    description: "",
    isActive: false,
  });

  const [filteredProducts, setFilteredProducts] = useState<Products[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleEditCategory = async () => {
    if (!categoryItem) return;
    console.log(categoryItem);
    const body = {
      code: categoryItem.code,
      description: categoryItem.description,
      isActive: categoryItem.isActive,
    };

    const response = await handlePut("api/ProductCategory/Update", body);
    if (response.isSuccessfull) {
      toast.success("Kategoria u perditesua");
      setTimeout(() => {
        window.location.reload();
      }, 1750);
    } else if (response.error) {
      toast.error(response.errorMessage);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryItem) return;
    const body = {
      code: categoryItem.code,
      description: categoryItem.description,
      isActive: categoryItem.isActive,
    };
    const response = await handlePost(`api/ProductCategory/Add`, body);
    if (response.isSuccessfull) {
      toast.success("Kategoria u shtua");
      setTimeout(() => {
        window.location.reload();
      }, 1750);
    } else toast.error(response.errorMessage);
  };

  const handleDeleteCategory = async () => {
    if (!categoryItem) return;
    const response = await handleDelete(
      `api/ProductCategory/Remove?code=${categoryItem.code}`
    );
    if (response.isSuccessfull) {
      toast.success("Kategoria u fshi!");
      setTimeout(() => {
        window.location.reload();
      }, 1750);
    } else if (response.error) {
      toast.error(response.errorMessage);
    }
  };

  const handleAddProduct = async () => {
    if (!selectedItem) return ;
    const body={
      category: selectedCategory?.code || "",
      orderNo:0,
      ...selectedItem

    }
    const response = await handlePost(`api/Product/Add`, body);
    if (response.isSuccessfull) {
      toast.success("Produkti u shtua");
      setTimeout(() => {
        window.location.reload();
      }, 1750);
    } else toast.error(response.errorMessage);
  };

  const handleEditProduct = async () => {
    if (!selectedItem) return;
    const body = {
      code: selectedItem.code,
      title: selectedItem.title,
      category: selectedItem.category,
      isActive: selectedItem.isActive,
      orderNo: selectedItem.orderNo,
      price: selectedItem.price
    }

    const response = await handlePut(`api/Product/Update`, body);
    if (response.isSuccessfull) {
      toast.success("Produkti u ndryshua");
      setTimeout(() => {
        window.location.reload();
      }, 1750);
    } else toast.error(response.errorMessage);

  };

  const handleDeleteProduct = async () => {
    if (!selectedItem) return;
    const response = await handleDelete(
      `api/Product/Remove?code=${selectedItem.code}`
    );
    if (response.isSuccessfull) {
      toast.success("Produkti u fshi!");
      setTimeout(() => {
        window.location.reload();
      }, 1750);
    } else if (response.error) {
      toast.error(response.errorMessage);
    }
  };

  const addCategory = useMemo(() => {
    return [
      {
        type: "text" as const,
        label: "Kode",
        props: {
          value: categoryItem.code,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: true,
        },
      },
      {
        type: "text" as const,
        label: "Kategoria",
        props: {
          value: categoryItem.description,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setCategoryItem((prev) => ({
              ...prev,
              description: e.target.value,
            }));
          },
        },
      },
      {
        type: "checkbox" as const,
        label: "Aktiv",
        props: {
          checked: categoryItem.isActive,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setCategoryItem((prev) => ({
              ...prev,
              isActive: e.target.checked,
            }));
          },
        },
      },
      {
        type: "group" as const,
        fields: [
          {
            type: "button" as const,
            label: "Konfirmo",
            props: {
              variant: "outlined",
              color: "success",
              onClick: handleAddCategory,
            },
          },
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "outlined",
              color: "warning",
              onClick: () => {
                setModalType("");
                setCategoryItem({ code: "", description: "", isActive: false });
              },
            },
          },
        ],
      },
    ];
  }, [categoryItem]);

  const editCategory = useMemo(() => {
    if (!categoryItem) return [];
    return [
      {
        type: "text" as const,
        label: "Kode",
        props: {
          value: categoryItem.code,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: true,
        },
      },
      {
        type: "text" as const,
        label: "Kategori",
        props: {
          value: categoryItem.description,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setCategoryItem((prev) => ({
              ...prev,
              description: e.target.value,
            }));
          },
        },
      },
      {
        type: "checkbox" as const,
        label: "Aktiv",
        props: {
          checked: categoryItem.isActive,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setCategoryItem((prev) => ({
              ...prev,
              isActive: e.target.checked,
            }));
          },
        },
      },
      {
        type: "group" as const,
        fields: [
          {
            type: "button" as const,
            label: "Konfirmo",
            props: {
              variant: "outlined",
              color: "success",
              onClick: handleEditCategory,
            },
          },
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "outlined",
              color: "warning",
              onClick: () => {
                setModalType("");
                setCategoryItem({
                  code: String(category.length + 1),
                  description: "",
                  isActive: true,
                });
              },
            },
          },
        ],
      },
    ];
  }, [categoryItem]);

  const deleteCategory = useMemo(() => {
    return [
      {
        type: "title" as const,
        label: `A doni te fshini kategorine "${categoryItem.description}" `,
        props: {
          variant: "contained",
          color: "primary",
        },
      },
      {
        type: "group" as const,
        fields: [
          {
            type: "button" as const,
            label: "Konfirmo",
            props: {
              variant: "outlined",
              color: "success",
              onClick: handleDeleteCategory,
            },
          },
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "outlined",
              color: "warning",
              onClick: () => setModalType(""),
            },
          },
        ],
      },
    ];
  }, [categoryItem]);

  const handleSelectCategory = async (cat: any) => {
    if (!cat) return;
    const response = await handleGet(
      `api/Product/GetByCategory?category=${cat.code}`
    );
    if (response.isSuccessfull) {
      setSelectedCategory(cat);
      setFilteredProducts(response.data);
    } else {
      toast.error(response.errorMessage);
    }
  };

  const addProduct =  useMemo(() => {
      return [
        {
          type: "text" as const,
          label: "Kode",
          props: {
            value: selectedItem.code,
            variant: "outlined",
            fullWidth: true,
            margin: "normal",
            disabled: true,
          },
        },
        {
          type: "text" as const,
          label: "Kategoria",
          props: {
            value: selectedCategory?.description || "",
            variant: "outlined",
            fullWidth: true,
            margin: "normal",
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              setSelectedItem((prev) => ({
                ...prev,
                description: e.target.value,
              }));
            },
            disabled: true,
          },
        },
        {
          type: "text" as const,
          label: "Produkti",
          props: {
            value: selectedItem.title,
            variant: "outlined",
            fullWidth: true,
            margin: "normal",
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;

              setSelectedItem((prev) => ({
                ...prev,
                title: e.target.value,
              }));
            },
          },
        },
        {
          type: "text" as const,
          label: "Qmimi",
          props: {
            value: selectedItem.price,
            variant: "outlined",
            fullWidth: true,
            margin: "normal",
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;

              if (/^\d*\.?\d*$/.test(value)) {
                setSelectedItem((prev) => ({
                  ...prev,
                  price: e.target.value,
                }));
              }
            },
          },
        },
        {
          type: "checkbox" as const,
          label: "Aktiv",
          props: {
            checked: selectedItem.isActive,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              setSelectedItem((prev) => ({
                ...prev,
                isActive: e.target.checked,
              }));
            },
          },
        },
        {
          type: "group" as const,
          fields: [
            {
              type: "button" as const,
              label: "Konfirmo",
              props: {
                variant: "outlined",
                color: "success",
                onClick: handleAddProduct,
              },
            },
            {
              type: "button" as const,
              label: "Mbyll",
              props: {
                variant: "outlined",
                color: "warning",
                onClick: () => {
                  setModalType("");
                  setSelectedItem({
                    code: "",
                    description: "",
                    isActive: false,
                  });
                },
              },
            },
          ],
        },
      ];
  }, [selectedItem,selectedCategory]);

  const editProduct =  useMemo(() => {
    return [
      {
        type: "text" as const,
        label: "Kode",
        props: {
          value: selectedItem.code,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: true,
        },
      },
      {
        type: "text" as const,
        label: "Titulli",
        props: {
          value: selectedItem.title,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setSelectedItem((prev) => ({
              ...prev,
              title: e.target.value,
            }));
          },
        },
      },
      {
        type: "text" as const,
        label: "Qmimi",
        props: {
          value: selectedItem.price,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setSelectedItem((prev) => ({
              ...prev,
              price: e.target.value,
            }));
          },
        },
      },
      {
        type: "checkbox" as const,
        label: "Aktiv",
        props: {
          checked: selectedItem.isActive,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setSelectedItem((prev) => ({
              ...prev,
              isActive: e.target.checked,
            }));
          },
        },
      },
      {
        type: "group" as const,
        fields: [
          {
            type: "button" as const,
            label: "Konfirmo",
            props: {
              variant: "outlined",
              color: "success",
              onClick: handleEditProduct,
            },
          },
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "outlined",
              color: "warning",
              onClick: () => {
                setModalType("");
                setSelectedItem({ code: "", description: "", isActive: false });
              }
            },
          },
        ],
      },
    ];
  }, [selectedItem, selectedCategory]);

  const deleteProduct =  useMemo(() => {
    return [
      {
        type: "title" as const,
        label: `A doni te fshini produktin "${selectedItem.title}" `,
        props: {
          variant: "contained",
          color: "primary",
        },
      },
      {
        type: "group" as const,
        fields: [
          {
            type: "button" as const,
            label: "Konfirmo",
            props: {
              variant: "outlined",
              color: "success",
              onClick: handleDeleteProduct,
            },
          },
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "outlined",
              color: "warning",
              onClick: () => setModalType(""),
            },
          },
        ],
      },
    ];
  }, [selectedItem, selectedCategory]);

  return (
    <div className="main_container">
      <ToastContainer />
      <div className="dark_theme_container">
        <MainHeader extra={"Home"} />
      </div>

      <div className="stock-body">
        {/* Category List */}
        <div className="stock-category-panel">
          <div className="header_stock_panel">
            <p>Kategoria</p>
            <ButtonComponent
              color="primary"
              variant="outlined"
              size="small"
              style={{ fontSize: "10px" }}
              startIcon={<CirclePlus size={15} />}
              onClick={() => {
                setModalType("addCategory");
                setCategoryItem((prev) => ({
                  ...prev,
                  code: String(category.length + 1),
                }));
              }}
            >
              Shto
            </ButtonComponent>
          </div>

          {category.length > 0 ? (
            category.map((cat) => (
              <div key={cat.code} className="stock-category">
                <div
                  key={cat.code}
                  onClick={() => handleSelectCategory(cat)}
                  className={`stock-category-item ${
                    selectedCategory?.code == cat.code ? "active" : ""
                  }`}
                >
                  {cat.description}
                </div>
                <ButtonComponent
                  color="info"
                  variant="outlined"
                  size="small"
                  style={{ fontSize: "10px" }}
                  startIcon={<Edit size={15} />}
                  onClick={() => {
                    setCategoryItem(cat);
                    setModalType("editCategory");
                  }}
                >
                  Edito
                </ButtonComponent>
                <ButtonComponent
                  color="error"
                  variant="outlined"
                  size="small"
                  style={{ fontSize: "10px" }}
                  startIcon={<XCircleIcon size={15} />}
                  onClick={() => {
                    setCategoryItem(cat);
                    setModalType("deleteCategory");
                  }}
                >
                  Fshi
                </ButtonComponent>
              </div>
            ))
          ) : (
            <div className="">Nuk keni kategori</div>
          )}
        </div>

        {/* Product List */}
        <div className="stock-product-panel">
            <div className="header_stock_panel">
              <p>Produktet</p>
              {selectedCategory?.description && <ButtonComponent
                color="primary"
                variant="outlined"
                size="small"
                style={{ fontSize: "10px" }}
                startIcon={<CirclePlus size={15} />}
                onClick={() => {
                  setSelectedItem((prev) => ({
                    ...prev,
                    code: String(filteredProducts.length + 1),
                  }));
                  setModalType("addProduct");
                }}
              >
                Shto
              </ButtonComponent>
              }
            </div>

          {selectedCategory?.code ? (
            filteredProducts.length > 0 ? (
              <div className="stock-product-list">
                {filteredProducts.map((product) => (
                  <div key={product.code} className="stock-product-card">
                    <div className="stock-product-info">
                      <p className="stock-product-title" title={product.title}>
                        {product.title}
                      </p>
                      <p className="stock-product-price">
                        {product.price.toFixed(2)}€
                      </p>
                      <div className="button_container">
                        <ButtonComponent
                          color="info"
                          variant="outlined"
                          size="small"
                          style={{ fontSize: "10px" }}
                          startIcon={<Edit size={15} />}
                          onClick={() => {
                            // setCategoryItem(cat);
                            setModalType("editProduct");
                            setSelectedItem(product);
                          }}
                        >
                          Ndrysho
                        </ButtonComponent>
                        <ButtonComponent
                          color="error"
                          variant="outlined"
                          size="small"
                          style={{ fontSize: "10px" }}
                          startIcon={<XCircleIcon size={15} />}
                          onClick={() => {
                            // setCategoryItem(cat);
                            setModalType("deleteProduct");
                            setSelectedItem(product);
                          }}
                        >
                          Fshi
                        </ButtonComponent>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="stock-product-placeholder">
                <p>Nuk ka produkte në këtë kategori!</p>
              </div>
            )
          ) : (
            <div className="stock-product-placeholder">
              <p>Zgjidh një kategori për të parë produktet.</p>
            </div>
          )}
        </div>
      </div>

      {modalType === "addCategory" && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain fieldConfig={addCategory} onClose={() => setModalType("")}  zIndex={20} theme={theme} />
        </div>
      )}

      {modalType === "editCategory" && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain fieldConfig={editCategory}  onClose={() => setModalType("")} zIndex={20}   theme={theme}   />
        </div>
      )}

      {modalType === "deleteCategory" && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain  fieldConfig={deleteCategory}  onClose={() => setModalType("")}  zIndex={20}  theme={theme} />
        </div>
      )}

      {modalType === "addProduct" && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain  fieldConfig={addProduct}    onClose={() => setModalType("")}  zIndex={20}  theme={theme}  />
        </div>
      )}

      {modalType === "editProduct" && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain  fieldConfig={editProduct}  onClose={() => setModalType("")}   zIndex={20} theme={theme}/>
        </div>
      )}

      {modalType === "deleteProduct" && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain   fieldConfig={deleteProduct}  onClose={() => setModalType("")}  zIndex={20} theme={theme} />
        </div>
      )}
    </div>
  );
};
