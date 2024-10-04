SELECT * FROM public.inventory
ORDER BY inv_id ASC;


INSERT INTO public.inventory (
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )
VALUES   (
    'Chevy',
    'Camaro',
    '2018',
    'If you want to look cool this is the ar you need! This car has great performance at an affordable price. Own it today!',
    '/images/camaro.jpg',
    '/images/camaro-tn.jpg',
    25000,
    101222,
    'Pink',
    2
);

DELETE FROM public.inventory WHERE inv_id = 16;


-- Assignments part
-- 1: Insert an account --
INSERT INTO public.account (
    account_firstname,
    account_lastname,
    account_email,
    account_password
)
VALUES (
    'Tony',
    'Stark',
    'tony@starknet.com',
    'Iam1ronM@n'
);

-- 2: Update account type --
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;


-- 3: Delete account --
DELETE FROM public.account
WHERE account_id = 1;

-- 4: Replace GM Hummer description --
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10;

-- 5: SELECT make and model firlds that belong to "Sport" category --
SELECT inv_make, inv_model, classification_name FROM public.inventory v
    JOIN public.classification c ON v.classification_id = c.classification_id
WHERE v.classification_id = 2;

-- 6: Add "/vehicles" to the middle of the file path --
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images', '/images/vehicles'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles');