import React, { Suspense, lazy } from 'react'
import { LoginForm } from '@/components/login-form';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/context/AppContext';
import AppLayout from '@/layouts/AppLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function lazyWithRetry(importer, key) {
    return lazy(async () => {
        const storageKey = `lazy-retry:${key}`;

        try {
            const module = await importer();
            sessionStorage.removeItem(storageKey);
            return module;
        } catch (error) {
            const hasRetried = sessionStorage.getItem(storageKey) === '1';

            if (!hasRetried && error instanceof TypeError) {
                sessionStorage.setItem(storageKey, '1');
                window.location.reload();
                return new Promise(() => {});
            }

            sessionStorage.removeItem(storageKey);
            throw error;
        }
    });
}

const Dashboard = lazyWithRetry(() => import('@/pages/dashboard'), 'dashboard');
// country route
const Countries = lazyWithRetry(() => import('@/pages/Country/country'), 'countries');
const AddContry = lazyWithRetry(() => import('@/pages/Country/addContry'), 'countries-add');
const EditContry = lazyWithRetry(() => import('@/pages/Country/editContry'), 'countries-edit');
// state route
const States = lazyWithRetry(() => import('@/pages/State/states'), 'states');
const AddState = lazyWithRetry(() => import('@/pages/State/addState'), 'states-add');
const EditState = lazyWithRetry(() => import('@/pages/State/editState'), 'states-edit');
// warehouse route
const Warehouse = lazyWithRetry(() => import('@/pages/Warehouse/warehouse'), 'warehouses');
const AddWarehouse = lazyWithRetry(() => import('@/pages/Warehouse/addWarehouse.jsx'), 'warehouses-add');
const EditWarehouse = lazyWithRetry(() => import('@/pages/Warehouse/editWarehouse.jsx'), 'warehouses-edit');
// user route
const Users = lazyWithRetry(() => import('@/pages/User/user'), 'users');
const AddUser = lazyWithRetry(() => import('@/pages/User/addUser'), 'users-add');
const EditUser = lazyWithRetry(() => import('@/pages/User/editUser'), 'users-edit');
// role route
const Roles = lazyWithRetry(() => import('@/pages/Role/roles'), 'roles');
const AddRole = lazyWithRetry(() => import('@/pages/Role/addRole'), 'roles-add');
const EditRole = lazyWithRetry(() => import('@/pages/Role/editRole'), 'roles-edit');
// Products for route
const ProductsFor = lazyWithRetry(() => import('@/pages/ProductsFor/productsFor'), 'products-for');
const AddProductsFor = lazyWithRetry(() => import('@/pages/ProductsFor/addProductsFor'), 'products-for-add');
const EditProductsFor = lazyWithRetry(() => import('@/pages/ProductsFor/editProductsFor'), 'products-for-edit');

// Rack 
const Rack = lazyWithRetry(() => import('@/pages/Rack/rack'), 'racks');
const AddRacks = lazyWithRetry(() => import('@/pages/Rack/addRack'), 'racks-add');
const EditRack = lazyWithRetry(() => import('@/pages/Rack/editRack'), 'racks-edit');

// Rack Rows
const RackRows = lazyWithRetry(() => import('@/pages/RackRow/rackRows'), 'rack-rows');
const AddRackRow = lazyWithRetry(() => import('@/pages/RackRow/addRackRow'), 'rack-rows-add');
const EditRackRow = lazyWithRetry(() => import('@/pages/RackRow/editRackRow'), 'rack-rows-edit');

// Brand
const Brand=lazyWithRetry(()=>import ('@/pages/Brand/brand'),'brands');
const AddBrand=lazyWithRetry(()=>import ('@/pages/Brand/addBrand'),'brands-add');
const EditBrand = lazyWithRetry(() => import('@/pages/Brand/editBrand'),'brands-edit');


// Color
const Color=lazyWithRetry(()=>import('@/pages/Color/color'),'colors');
const AddColor=lazyWithRetry(()=>import ('@/pages/Color/addColor'),'colors-add');
const EditColor = lazyWithRetry(() => import('@/pages/Color/editColor'),'colors-edit');

// Fabric
const Fabric=lazyWithRetry(()=>import('@/pages/Fabric/fabric'),'fabrics');
const AddFabric=lazyWithRetry(()=>import ('@/pages/Fabric/addFabric'),'fabrics-add');
const EditFabric = lazyWithRetry(() => import('@/pages/Fabric/editFabric'),'fabrics-edit');

// Size
const Size=lazyWithRetry(()=>import('@/pages/Size/size'),'size');
const AddSize=lazyWithRetry(()=>import ('@/pages/Size/addSize'),'size-add');
const EditSize = lazyWithRetry(() => import('@/pages/Size/editSize'),'size-edit');

// Product
const Product = lazyWithRetry(() => import('@/pages/Product/product'), 'products');
const AddProduct = lazyWithRetry(() => import('@/pages/Product/addProduct'), 'products-add');
const EditProduct = lazyWithRetry(() => import('@/pages/Product/editProduct'), 'products-edit');

export default function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
                                    <LoginForm />
                                </main>
                            }
                        />

                        <Route element={<AppLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />

                            {/* Countries */}
                            <Route path="/countries" element={<Countries />} />
                            <Route path="/countries/add" element={<AddContry />} />
                            <Route path="/countries/:id/edit" element={<EditContry />} />

                            {/* States */}
                            <Route path="/states" element={<States />} />
                            <Route path="/states/add" element={<AddState />} />
                            <Route path="/states/:id/edit" element={<EditState />} />

                            {/* warehouses */}
                            <Route path="/warehouses" element={<Warehouse/>}/>
                            <Route path="/warehouses/add" element={<AddWarehouse/>}/>
                            <Route path="/warehouses/:id/edit" element={<EditWarehouse />} />

                            {/* users */}
                            <Route path="/users" element={<Users/>}/>
                            <Route path="/users/add" element={<AddUser />} />
                            <Route path="/users/:id/edit" element={<EditUser />} />

                            {/* roles */}
                            <Route path="/roles" element={<Roles/>}/>
                            <Route path="/roles/add" element={<AddRole />} />
                            <Route path="/roles/:id/edit" element={<EditRole />} />

                            {/* Products For */}
                            <Route path="/productsfor" element={<ProductsFor/>}/>
                            <Route path="/productsfor/add" element={<AddProductsFor />} />
                            <Route path="/productsfor/:id/edit" element={<EditProductsFor />} />

                            {/* Rack */}
                            <Route path="/racks" element={<Rack/>}/>
                            <Route path="/racks/add" element={<AddRacks/>}/>
                            <Route path="/racks/:id/edit" element={<EditRack/>}/>

                            {/* Rack Rows */}
                            <Route path="/racks/:rack_id/rows" element={<RackRows/>}/>
                            <Route path="/racks/:rack_id/rows/add" element={<AddRackRow/>}/>
                            <Route path="/racks/:rack_id/rows/:id/edit" element={<EditRackRow/>}/>

                            {/* Brand */}
                            <Route path="/brands" element={<Brand/>}/>
                            <Route path="/brands/add" element={<AddBrand/>}/>
                            <Route path="/brands/:id/edit" element={<EditBrand/>}/>

                            {/* Color */}
                            <Route path="/colors" element={<Color/>}/>
                            <Route path="/colors/add" element={<AddColor/>}/>
                            <Route path="/colors/:id/edit" element={<EditColor/>}/>

                            {/* Fabric */}
                            <Route path="/fabrics" element={<Fabric/>}/>
                            <Route path="/fabrics/add" element={<AddFabric/>}/>
                            <Route path="/fabrics/:id/edit" element={<EditFabric/>}/>

                             {/* Size */}
                            <Route path="/sizes" element={<Size/>}/>
                            <Route path="/sizes/add" element={<AddSize/>}/>
                            <Route path="/sizes/:id/edit" element={<EditSize/>}/>

                            {/* Product */}
                            <Route path="/products" element={<Product/>}/>
                            <Route path="/products/add" element={<AddProduct/>}/>
                            <Route path="/products/:id/edit" element={<EditProduct/>}/>
                        </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
            <Toaster position="top-right" richColors />
        </AppProvider>
    );
}